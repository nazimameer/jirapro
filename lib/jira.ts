import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { getSession } from "./auth";
import dbConnect from "./db";
import { trackApiError } from "./monitoring";
import User from "@/models/User";

const ATLASSIAN_API_URL = "https://api.atlassian.com/ex/jira";

export class JiraError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
    this.name = "JiraError";
  }
}

declare global {
  // eslint-disable-next-line no-var
  var jiraTokenRefreshLocks: Record<string, Promise<string> | undefined> | undefined;
}

function getJiraTokenRefreshLocks() {
  if (!global.jiraTokenRefreshLocks) {
    global.jiraTokenRefreshLocks = {};
  }
  return global.jiraTokenRefreshLocks;
}

/**
 * Creates a Jira Axios instance for a specific cloudId or domain
 */
function createJiraClient(
  target: string, 
  auth: { type: 'oauth' | 'basic'; token: string; email?: string },
  apiPrefix: string = "rest/api/3"
): AxiosInstance {
  const isOAuth = auth.type === 'oauth';
  
  const baseURL = isOAuth 
    ? `${ATLASSIAN_API_URL}/${target}/${apiPrefix}`
    : `https://${target}.atlassian.net/${apiPrefix}`;

  const authHeader = isOAuth
    ? `Bearer ${auth.token}`
    : `Basic ${Buffer.from(`${auth.email}:${auth.token}`).toString('base64')}`;

  const client = axios.create({
    baseURL,
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      const isStatusRetryable = error.response?.status === 429 || (error.response?.status || 0) >= 500;
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || isStatusRetryable;
    },
  });

  return client;
}

export async function refreshToken(userId: string, currentRefreshToken: string) {
  const locks = getJiraTokenRefreshLocks();
  const lockKey = String(userId);

  if (locks[lockKey]) {
    return await locks[lockKey];
  }

  locks[lockKey] = (async () => {
    try {
      const response = await axios.post("https://auth.atlassian.com/oauth/token", {
        grant_type: "refresh_token",
        client_id: process.env.ATLASSIAN_CLIENT_ID,
        client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
        refresh_token: currentRefreshToken,
      });

      const { access_token, refresh_token } = response.data;

      await dbConnect();
      await User.findByIdAndUpdate(userId, {
        accessToken: access_token,
        refreshToken: refresh_token,
      });

      return access_token as string;
    } catch (error: any) {
      console.error("Token refresh failed:", error.response?.data || error.message);
      throw new JiraError("Session expired. Please log in again.", 401);
    } finally {
      delete locks[lockKey];
    }
  })();

  return await locks[lockKey];
}

export async function requestJira({ 
  url, 
  method = "GET", 
  data, 
  params,
  userAccountId,
  apiPrefix = "rest/api/3"
}: { 
  url: string; 
  method?: string; 
  data?: any; 
  params?: any;
  userAccountId?: string;
  apiPrefix?: string;
}) {
  const shouldTrackErrorStatus = (status?: number) => status === 429 || status === 403 || status === 500;
  let targetAccountId = userAccountId;

  if (!targetAccountId) {
    const session = await getSession();
    if (!session) throw new JiraError("Unauthorized", 401);
    targetAccountId = session.userAccountId;
  }

  await dbConnect();
  const user = await User.findOne({ accountId: targetAccountId });
  
  // --- Dual Auth Flow ---
  
  // A. OAuth Path (If user found in DB)
  if (user) {
    let cloudId = user.cloudId;
    
    if (!cloudId) {
      console.log("No cloudId found for user. Fetching accessible resources...");
      const cloudsResponse = await axios.get("https://api.atlassian.com/oauth/token/accessible-resources", {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      
      const resources = cloudsResponse.data;
      
      if (resources.length === 1) {
        // Auto-select if only one
        cloudId = resources[0].id;
        user.cloudId = cloudId;
        await user.save();
      } else if (resources.length > 1) {
        // Multiple sites, need user to select
        throw new JiraError("Multiple sites found. Please select a site.", 403);
      } else {
        throw new JiraError("No accessible Jira resources found", 404);
      }
    }

    const accessToken = user.accessToken;
    if (/[\r\n]/.test(accessToken)) {
      console.error("CRITICAL: Access token contains invalid characters");
    }

    const client = createJiraClient(cloudId, { type: 'oauth', token: accessToken }, apiPrefix);

    try {
      const response = await client.request({ url, method, data, params });
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (shouldTrackErrorStatus(status)) {
        trackApiError(status, {
          url,
          method,
          apiPrefix,
          authType: "oauth",
          accountId: targetAccountId,
        });
      }
      if (error.response?.status === 401) {
        console.log("Token expired, attempting refresh...");
        const newAccessToken = await refreshToken(user._id, user.refreshToken);
        const retryClient = createJiraClient(cloudId, { type: 'oauth', token: newAccessToken }, apiPrefix);
        try {
          const retryResponse = await retryClient.request({ url, method, data, params });
          return retryResponse.data;
        } catch (retryError: any) {
          const retryStatus = retryError?.response?.status;
          if (shouldTrackErrorStatus(retryStatus)) {
            trackApiError(retryStatus, {
              url,
              method,
              apiPrefix,
              authType: "oauth_retry",
              accountId: targetAccountId,
            });
          }
          throw retryError;
        }
      }
      throw error;
    }
  }

  // B. Legacy API Token Fallback (If no user session, try environment variables)
  const legacyToken = process.env.JIRA_API_TOKEN;
  const legacyEmail = process.env.JIRA_EMAIL;
  const legacyDomain = process.env.JIRA_DOMAIN;

  if (legacyToken && legacyEmail && legacyDomain) {
    console.log("Using legacy API Token authentication fallback...");
    const client = createJiraClient(legacyDomain, { 
      type: 'basic', 
      token: legacyToken, 
      email: legacyEmail 
    }, apiPrefix);

    try {
      const response = await client.request({ url, method, data, params });
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (shouldTrackErrorStatus(status)) {
        trackApiError(status, {
          url,
          method,
          apiPrefix,
          authType: "legacy",
          domain: legacyDomain,
        });
      }
      throw error;
    }
  }

  throw new JiraError("Authentication required (No active session or legacy credentials)", 401);
}

export async function fetchWithPagination<T>(
  url: string, 
  options: { query?: string; params?: any; userAccountId?: string } = {}
): Promise<T[]> {
  let allResults: T[] = [];
  let startAt = 0;
  const maxResults = 50;
  let isLast = false;

  while (!isLast) {
    const response = await requestJira({
      url,
      userAccountId: options.userAccountId,
      params: {
        ...options.params,
        ...(options.query ? { query: options.query } : {}),
        startAt,
        maxResults,
      },
    });

    const items = response.values || response.issues || response;
    if (Array.isArray(items)) {
      allResults = [...allResults, ...items];
      
      const total = response.total ?? allResults.length;
      if (response.isLast === true || total <= startAt + maxResults || !Array.isArray(items)) {
        isLast = true;
      } else {
        startAt += maxResults;
      }
    } else {
      isLast = true;
    }
  }

  return allResults;
}

export function limitConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  let i = 0;
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  const runTask = async (task: () => Promise<T>, index: number) => {
    const result = await task();
    results[index] = result;
  };

  const enqueue = (): Promise<void> => {
    if (i === tasks.length) return Promise.resolve();
    const task = tasks[i++];
    const promise = runTask(task, i - 1);
    const e: any = promise.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    let r = Promise.resolve();
    if (executing.length >= limit) {
      r = Promise.race(executing);
    }
    return r.then(() => enqueue());
  };

  return enqueue().then(() => Promise.all(executing)).then(() => results);
}
