type MonitoringPayload = Record<string, unknown>;

type MonitoringCounters = {
  tasksCreated: number;
  bulkRuns: number;
  bulkSuccesses: number;
  bulkFailures: number;
  apiErrors: number;
  transitionFailures: number;
};

declare global {
  // eslint-disable-next-line no-var
  var monitoringCounters: MonitoringCounters | undefined;
}

function getCounters(): MonitoringCounters {
  if (!global.monitoringCounters) {
    global.monitoringCounters = {
      tasksCreated: 0,
      bulkRuns: 0,
      bulkSuccesses: 0,
      bulkFailures: 0,
      apiErrors: 0,
      transitionFailures: 0,
    };
  }
  return global.monitoringCounters;
}

export function trackEvent(event: string, payload: MonitoringPayload = {}) {
  console.log("[monitoring:event]", {
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  });
}

export function trackApiError(status: number | undefined, payload: MonitoringPayload = {}) {
  const counters = getCounters();
  counters.apiErrors += 1;
  trackEvent("jira_api_error", { status: status ?? "unknown", ...payload, counters });
}

export function trackOAuthSuccess(payload: MonitoringPayload = {}) {
  trackEvent("oauth_success", payload);
}

export function trackOAuthFailure(payload: MonitoringPayload = {}) {
  trackEvent("oauth_failure", payload);
}

export function trackBulkSummary(payload: {
  total: number;
  successful: number;
  failed: number;
  retried: number;
  transitionFailed: number;
}) {
  const counters = getCounters();
  counters.bulkRuns += 1;
  counters.bulkSuccesses += payload.successful;
  counters.bulkFailures += payload.failed;
  counters.tasksCreated += payload.successful;
  counters.transitionFailures += payload.transitionFailed;

  const successRate = payload.total > 0 ? Number((payload.successful / payload.total).toFixed(4)) : 0;
  trackEvent("bulk_create_summary", {
    ...payload,
    successRate,
    counters,
  });
}

