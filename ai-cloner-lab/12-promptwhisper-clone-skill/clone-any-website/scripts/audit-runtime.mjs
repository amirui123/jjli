export function redactUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    for (const key of [...url.searchParams.keys()]) url.searchParams.set(key, '[redacted]');
    url.username = '';
    url.password = '';
    return url.href;
  } catch {
    return '[invalid-url]';
  }
}

export function redactText(value) {
  return String(value).replace(/https?:\/\/[^\s"'<>]+/gu, (match) => redactUrl(match));
}

export function createAudit(side, config) {
  return {
    version: 1,
    side,
    requests: [],
    responses: [],
    console_errors: [],
    page_errors: [],
    request_failures: [],
    http_status_failures: [],
    forbidden_target_requests: [],
    blocked_origins: [],
    unlisted_origins: [],
    _state: null,
    _targetOrigin: new URL(config.target.url).origin,
  };
}

function requestRecord(request, audit, blockedByPolicy = false) {
  const rawUrl = request.url();
  let origin = null;
  try { origin = new URL(rawUrl).origin; } catch { /* retained as null */ }
  return {
    state: audit._state,
    url: redactUrl(rawUrl),
    method: request.method(),
    resource_type: request.resourceType(),
    origin,
    is_target_origin: origin === audit._targetOrigin,
    blocked_by_policy: blockedByPolicy,
  };
}

export async function installOriginPolicy(context, side, config, audit) {
  const allowed = new Set(config.network.allowed_target_origins);
  await context.route('**/*', async (route) => {
    const request = route.request();
    let origin = null;
    let isHttp = false;
    try {
      const parsed = new URL(request.url());
      origin = parsed.origin;
      isHttp = ['http:', 'https:'].includes(parsed.protocol);
    } catch { /* invalid URLs are handled by Chromium */ }
    const targetStrictBlock = side === 'target'
      && config.network.target_capture_origin_policy === 'strict'
      && isHttp
      && !allowed.has(origin);
    const cloneTargetBlock = side === 'clone'
      && config.network.forbid_target_origin_in_clone_runtime
      && origin === audit._targetOrigin;
    if (targetStrictBlock || cloneTargetBlock) {
      const record = requestRecord(request, audit, true);
      audit.blocked_origins.push(record);
      if (cloneTargetBlock) audit.forbidden_target_requests.push(record);
      await route.abort('blockedbyclient');
      return;
    }
    await route.continue();
  });
}

export function attachPageAudit(page, audit, config) {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      audit.console_errors.push({ state: audit._state, text: redactText(message.text()) });
    }
  });
  page.on('pageerror', (error) => {
    audit.page_errors.push({ state: audit._state, message: redactText(error.message) });
  });
  page.on('request', (request) => {
    const record = requestRecord(request, audit);
    audit.requests.push(record);
    if (audit.side === 'target' && record.origin && record.origin !== 'null' && !config.network.allowed_target_origins.includes(record.origin)) {
      audit.unlisted_origins.push(record);
    }
  });
  page.on('requestfailed', (request) => {
    audit.request_failures.push({
      ...requestRecord(request, audit),
      error: redactText(request.failure()?.errorText ?? 'unknown request failure'),
    });
  });
  page.on('response', async (response) => {
    const request = response.request();
    const record = {
      ...requestRecord(request, audit),
      status: response.status(),
      mime: (await response.headerValue('content-type'))?.split(';')[0] ?? null,
    };
    audit.responses.push(record);
    if (response.status() >= 400) audit.http_status_failures.push(record);
  });
}

export function finalizeAudit(audit) {
  const { _state, _targetOrigin, ...safeAudit } = audit;
  for (const key of Object.keys(safeAudit)) {
    if (Array.isArray(safeAudit[key])) {
      safeAudit[key].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }
  }
  return safeAudit;
}

export function auditGateFailures(audit, config) {
  const failures = [];
  if (config.network.fail_on_console_error && audit.console_errors.length) failures.push(`${audit.side}: console errors (${audit.console_errors.length})`);
  if (config.network.fail_on_page_error && audit.page_errors.length) failures.push(`${audit.side}: page errors (${audit.page_errors.length})`);
  if (config.network.fail_on_request_failure && audit.request_failures.length) failures.push(`${audit.side}: request failures (${audit.request_failures.length})`);
  const statuses = new Set(config.network.fail_on_http_status);
  const matchingStatuses = audit.http_status_failures.filter((entry) => statuses.has(entry.status));
  if (matchingStatuses.length) failures.push(`${audit.side}: configured HTTP status failures (${matchingStatuses.length})`);
  if (audit.side === 'clone' && config.network.forbid_target_origin_in_clone_runtime && audit.forbidden_target_requests.length) {
    failures.push(`clone: forbidden target-origin requests (${audit.forbidden_target_requests.length})`);
  }
  return failures;
}
