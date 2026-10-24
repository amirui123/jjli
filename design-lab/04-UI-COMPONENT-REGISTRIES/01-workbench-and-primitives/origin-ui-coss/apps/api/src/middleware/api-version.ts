/**
 * Dated API versions (`Coss-Version`). Handlers always build the latest shape; `apiVersion` renders 2xx JSON
 * bodies in the caller's version on the way out, and `upgradeRequestBody` rewrites older request bodies into the
 * latest shape before validation. The version is the header's, else the organization's pin (`requireApiKey`).
 * Error envelopes are never versioned.
 */
import { API_VERSION_HEADER, type RequestKey } from "@coss/versioning";
import { createMiddleware } from "hono/factory";
import { ApiError } from "../errors.ts";
import type { AppEnv } from "../types.ts";

const JSON_CONTENT_TYPE = /^application\/json\b/i;

/** Validates `Coss-Version`, echoes the version a response is rendered in and renders 2xx JSON in it. */
export const apiVersion = createMiddleware<AppEnv>(async (c, next) => {
  const { versioning } = c.var;
  const requested = c.req.header(API_VERSION_HEADER)?.trim() || null;
  if (requested !== null && !versioning.isVersion(requested)) {
    throw new ApiError(400, {
      type: "invalid_request_error",
      code: "invalid_api_version",
      param: API_VERSION_HEADER,
      message:
        `Unknown API version "${requested.slice(0, 32)}". Use one of ${versioning.versions.join(", ")}, ` +
        `or omit ${API_VERSION_HEADER} to use your organization's version.`,
    });
  }
  c.set("requestedApiVersion", requested);
  await next();

  // Set by `requireApiKey`; before authentication only an explicit header is known.
  const version = c.var.apiVersion ?? requested;
  if (version === null) return;
  const res = c.res;
  if (
    version !== versioning.latest &&
    res.status >= 200 &&
    res.status < 300 &&
    JSON_CONTENT_TYPE.test(res.headers.get("content-type") ?? "")
  ) {
    const body = versioning.downgrade(await res.json(), version);
    const headers = new Headers(res.headers);
    headers.delete("content-length");
    headers.set(API_VERSION_HEADER, version);
    // Unset first: Hono's setter would otherwise copy the old response's headers over the new ones.
    c.res = undefined;
    c.res = new Response(JSON.stringify(body), { status: res.status, headers });
    return;
  }
  res.headers.set(API_VERSION_HEADER, version);
});

/**
 * Route middleware for routes with a JSON body, last in `createRoute({ middleware })` (after authentication and
 * the body limit, before validation): rewrites a body written for an older version into the latest shape when a
 * version change says how. Reads nothing when no change applies; unparsable bodies are left to validation.
 */
export function upgradeRequestBody(key: RequestKey) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const { versioning, apiVersion } = c.var;
    if (apiVersion !== undefined && versioning.hasRequestChanges(key, apiVersion)) {
      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        return next();
      }
      const upgraded = JSON.stringify(versioning.upgradeRequest(key, body, apiVersion));
      // Hono's validator reads `c.req.json()`, which parses the cached text. The cache holds promises, though
      // its type says otherwise.
      c.req.bodyCache.text = Promise.resolve(upgraded) as unknown as string;
    }
    await next();
  });
}
