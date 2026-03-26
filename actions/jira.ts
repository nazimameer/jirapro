"use server";

import { requestJira, fetchWithPagination, JiraError, limitConcurrency } from "@/lib/jira";
import { getSession } from "@/lib/auth";
import { trackBulkSummary, trackEvent } from "@/lib/monitoring";
import { unstable_cache } from "next/cache";
import { IssueSchema } from "@/lib/validation";

async function handleAction<T>(action: () => Promise<T>) {
  try {
    return { data: await action(), error: null };
  } catch (error: any) {
    console.error("Jira Action Error:", error);
    if (error instanceof JiraError) {
      return { data: null, error: { message: error.message, status: error.status } };
    }
    return { data: null, error: { message: error.message || "An unexpected error occurred", status: 500 } };
  }
}

export async function getProjects() {
  return handleAction(async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    const accountId = session.userAccountId;

    return unstable_cache(
      async (uid: string) => requestJira({ url: "project", userAccountId: uid }),
      ["projects"],
      { revalidate: 3600, tags: [`projects-${accountId}`] } 
    )(accountId);
  });
}

export async function getUsers(query?: string) {
  return handleAction(async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    const accountId = session.userAccountId;

    if (!query) {
      return unstable_cache(
        async (uid: string) => fetchWithPagination<any>("users/search", { userAccountId: uid }),
        ["users-base"],
        { revalidate: 3600, tags: [`users-${accountId}`] }
      )(accountId);
    }
    return fetchWithPagination<any>("users/search", { query, userAccountId: accountId });
  });
}

export async function getStatuses() {
  return handleAction(async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    const accountId = session.userAccountId;

    return unstable_cache(
      async (uid: string) => requestJira({ url: "status", userAccountId: uid }),
      ["statuses"],
      { revalidate: 3600, tags: [`statuses-${accountId}`] }
    )(accountId);
  });
}

export async function getBoards() {
  return handleAction(async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    const accountId = session.userAccountId;

    return unstable_cache(
      async (uid: string) => requestJira({ 
        url: "board", 
        userAccountId: uid, 
        apiPrefix: "rest/agile/1.0" 
      }),
      ["boards"],
      { revalidate: 3600, tags: [`boards-${accountId}`] } 
    )(accountId);
  });
}

export async function getBoardConfiguration(boardId: string) {
  return handleAction(async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    const accountId = session.userAccountId;

    return unstable_cache(
      async (bid: string, uid: string) => requestJira({ 
        url: `board/${bid}/configuration`, 
        userAccountId: uid, 
        apiPrefix: "rest/agile/1.0" 
      }),
      [`board-config-${boardId}`],
      { revalidate: 3600, tags: [`board-config-${boardId}-${accountId}`] } 
    )(boardId, accountId);
  });
}

export async function createIssue(payload: any) {
  return handleAction(async () => {
    const validated = IssueSchema.parse(payload);
    return requestJira({
      method: "POST",
      url: "issue",
      data: validated,
    });
  });
}

export async function getTransitions(issueIdOrKey: string) {
  return handleAction(async () => {
    const response: any = await requestJira({
      url: `issue/${issueIdOrKey}/transitions`,
    });
    return response.transitions;
  });
}

type BulkCreateOptions =
  | string
  | {
      targetStatus?: string;
      targetStatusIds?: string[];
    }
  | undefined;

function normalizeBulkCreateOptions(options: BulkCreateOptions): {
  targetStatus?: string;
  targetStatusIds?: string[];
} {
  if (!options) return {};
  if (typeof options === "string") return { targetStatus: options };
  return { targetStatus: options.targetStatus, targetStatusIds: options.targetStatusIds };
}

export async function bulkCreateIssues(issueUpdates: any[], options?: BulkCreateOptions) {
  return handleAction(async () => {
    const { targetStatus, targetStatusIds } = normalizeBulkCreateOptions(options);
    const CONCURRENCY_LIMIT = 5;
    const MAX_RETRIES = 2;

    const results = await limitConcurrency(
      issueUpdates.map((issue, index) => async () => {
        const validated = IssueSchema.parse(issue);
        let attempt = 0;
        let created: any = null;
        let lastError: any = null;

        while (attempt <= MAX_RETRIES) {
          try {
            created = await requestJira({
              url: "issue",
              method: "POST",
              data: validated,
            });
            break;
          } catch (error: any) {
            lastError = error;
            attempt++;
            if (attempt <= MAX_RETRIES) {
              await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
            }
          }
        }

        if (!created) {
          return {
            index,
            success: false,
            attempts: attempt,
            error: lastError?.message || "Failed after retries",
          };
        }

        let transitionSuccess = true;
        let transitionError = "";

        if (targetStatus || (Array.isArray(targetStatusIds) && targetStatusIds.length > 0)) {
          try {
            const transitionsResult: any = await requestJira({ url: `issue/${created.id}/transitions` });
            const transitions = transitionsResult.transitions || [];
            const target =
              (Array.isArray(targetStatusIds) && targetStatusIds.length > 0
                ? transitions.find((t: any) => targetStatusIds.includes(String(t?.to?.id)))
                : null) ||
              (targetStatus
                ? transitions.find((t: any) => String(t?.name || "").toLowerCase() === targetStatus.toLowerCase())
                : null);

            if (target) {
              await requestJira({
                url: `issue/${created.id}/transitions`,
                method: "POST",
                data: { transition: { id: target.id } },
              });
            } else {
              transitionSuccess = false;
              transitionError = targetStatus
                ? `No transition found for status: ${targetStatus}`
                : "No transition found for selected column statuses";
            }
          } catch (error: any) {
            transitionSuccess = false;
            transitionError = error?.message || "Transition failed";
            trackEvent("transition_failure", {
              issueId: created.id,
              issueKey: created.key,
              targetStatus: targetStatus || undefined,
              targetStatusIds: targetStatusIds || undefined,
              reason: transitionError,
              flow: "bulk_create",
            });
          }
        }

        return {
          index,
          success: true,
          attempts: attempt + 1,
          issueId: created.id,
          issueKey: created.key,
          transitioned: (!!targetStatus || (Array.isArray(targetStatusIds) && targetStatusIds.length > 0)) && transitionSuccess,
          transitionError: transitionError || undefined,
        };
      }),
      CONCURRENCY_LIMIT
    );

    const successful = results.filter((result) => result.success).length;
    const failed = results.length - successful;
    const retried = results.filter((result) => result.attempts > 1).length;
    const transitionFailed = results.filter(
      (result) => result.success && result.transitioned === false
    ).length;
    trackBulkSummary({
      total: results.length,
      successful,
      failed,
      retried,
      transitionFailed,
    });

    return {
      results,
      summary: {
        total: results.length,
        successful,
        failed,
        retried,
        transitionFailed,
        concurrencyLimit: CONCURRENCY_LIMIT,
        maxRetries: MAX_RETRIES,
      },
    };
  });
}

export async function createSingleIssue(issue: any, targetStatus?: string) {
  return handleAction(async () => {
    const validated = IssueSchema.parse(issue);
    const created: any = await requestJira({
      url: "issue",
      method: "POST",
      data: validated
    });

    let transitionSuccess = true;
    let transitionError = "";

    if (targetStatus) {
      try {
        const transitionsResult: any = await requestJira({ url: `issue/${created.id}/transitions` });
        const transitions = transitionsResult.transitions || [];
        const target = transitions.find((t: any) => t.name.toLowerCase() === targetStatus.toLowerCase());
        
        if (target) {
          await requestJira({
            url: `issue/${created.id}/transitions`,
            method: "POST",
            data: { transition: { id: target.id } }
          });
        } else {
          transitionSuccess = false;
          transitionError = `No transition found for status: ${targetStatus}`;
        }
      } catch (e: any) {
        transitionSuccess = false;
        transitionError = e.message || "Transition failed";
        trackEvent("transition_failure", {
          issueId: created.id,
          issueKey: created.key,
          targetStatus,
          reason: transitionError,
          flow: "single_create",
        });
        console.warn(`Failed to transition issue ${created.key}:`, e);
      }
    }

    return { 
      ...created,
      transitioned: !!targetStatus && transitionSuccess,
      transitionError: transitionError || undefined
    };
  });
}

export async function transitionIssue(issueIdOrKey: string, transitionId: string) {
  return handleAction(async () => {
    return requestJira({
      method: "POST",
      url: `issue/${issueIdOrKey}/transitions`,
      data: { transition: { id: transitionId } },
    });
  });
}
