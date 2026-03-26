import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { getSession } from "./auth";
import dbConnect from "./db";
import User from "@/models/User";

const ATLASSIAN_API_URL = "https://api.atlassian.com/ex/jira";

export class JiraError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
    this.name = "JiraError";
  }
}

/**
 * Creates a Jira Axios instance for a specific cloudId
 */
function createJiraClient(cloudId: string, accessToken: string): AxiosInstance {
  const client = axios.create({
    baseURL: `${ATLASSIAN_API_URL}/${cloudId}/rest/api/3`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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

    return access_token;
  } catch (error: any) {
    console.error("Token refresh failed:", error.response?.data || error.message);
    throw new JiraError("Session expired. Please log in again.", 401);
  }
}

export async function requestJira({ 
  url, 
  method = "GET", 
  data, 
  params,
  userAccountId 
}: { 
  url: string; 
  method?: string; 
  data?: any; 
  params?: any;
  userAccountId?: string;
}) {
  let targetAccountId = userAccountId;

  if (!targetAccountId) {
    const session = await getSession();
    if (!session) throw new JiraError("Unauthorized", 401);
    targetAccountId = session.userAccountId;
  }

  await dbConnect();
  const user = await User.findOne({ accountId: targetAccountId });
  if (!user) throw new JiraError("User not found", 404);

  // 1. Get cloudId (use cached if available)
  let cloudId = user.cloudId;
  
  if (!cloudId) {
    console.log("Fetching accessible resources (first time cache)...");
    const cloudsResponse = await axios.get("https://api.atlassian.com/oauth/token/accessible-resources", {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });
    
    cloudId = cloudsResponse.data[0]?.id;
    if (!cloudId) throw new JiraError("No accessible Jira resources found", 404);
    
    // Save to user for future requests
    user.cloudId = cloudId;
    await user.save();
  }

  const client = createJiraClient(cloudId, user.accessToken);

  try {
    const response = await client.request({ url, method, data, params });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log("Token expired, attempting refresh...");
      try {
        const newAccessToken = await refreshToken(user._id, user.refreshToken);
        const retryClient = createJiraClient(cloudId, newAccessToken);
        const retryResponse = await retryClient.request({ url, method, data, params });
        return retryResponse.data;
      } catch (refreshError: any) {
        throw refreshError;
      }
    }

    if (error.response) {
      const jiraMessage = error.response.data?.errorMessages?.[0] || error.response.data?.message || error.message;
      throw new JiraError(jiraMessage, error.response.status);
    }
    throw error;
  }
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
