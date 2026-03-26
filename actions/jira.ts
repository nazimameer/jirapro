"use server";

import { requestJira, fetchWithPagination, JiraError, limitConcurrency } from "@/lib/jira";
import { getSession } from "@/lib/auth";
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

export async function bulkCreateIssues(issueUpdates: any[], targetStatus?: string) {
  return handleAction(async () => {
    return limitConcurrency(issueUpdates.map(issue => async () => {
      const validated = IssueSchema.parse(issue);
      const created: any = await requestJira({
        url: "issue",
        method: "POST",
        data: validated
      });

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
          }
        } catch (e) {
          console.warn(`Failed to transition issue ${created.key}:`, e);
        }
      }
      return created;
    }), 3);
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
        }
      } catch (e) {
        console.warn(`Failed to transition issue ${created.key}:`, e);
      }
    }
    return created;
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
