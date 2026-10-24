import { createHash } from "node:crypto";
import {
  type AuthenticateResult,
  authenticateApiKey,
  type KeyPermissions,
  permissionStrings,
} from "@coss/tenancy";
import { setTags } from "@sentry/bun";
import { createMiddleware } from "hono/factory";
import { ApiError } from "../errors.ts";
import type { AppEnv } from "../types.ts";
import { rateLimitError } from "./rate-limit.ts";

export type Authenticate = (
  rawKey: string,
  required: KeyPermissions,
) => Promise<AuthenticateResult>;

const BEARER = /^bearer\s+(.+)$/i;

// RFC 6750: 401 responses name the scheme the client should use.
const WWW_AUTHENTICATE = { "WWW-Authenticate": "Bearer" };

const tooManyFailures = {
  code: "too_many_failed_authentications",
  message: "Too many requests with invalid API keys from this address. Retry later.",
};

const tooManyAuthentications = {
  code: "too_many_authentications",
  message: "Too many API authentication attempts. Retry later.",
};

/**
 * Route-level middleware (`createRoute({ middleware })`) so it runs before request validation:
 * an unauthenticated caller gets a 401, never a 422 describing the endpoint's schema. Callers
 * whose keys keep failing are cut off per client IP (`api.auth_failure`) before the key lookup.
 * `authenticate` is injectable for tests only.
 */
export function requireApiKey(
  required: KeyPermissions,
  options: { authenticate?: Authenticate } = {},
) {
  const authenticate = options.authenticate ?? authenticateApiKey;

  return createMiddleware<AppEnv>(async (c, next) => {
    const header = c.req.header("Authorization");
    const key = header ? BEARER.exec(header.trim())?.[1]?.trim() : undefined;
    if (!key) {
      throw new ApiError(
        401,
        {
          type: "authentication_error",
          code: "missing_api_key",
          message: header
            ? "The Authorization header must use the Bearer scheme: `Authorization: Bearer coss_…`."
            : "No API key provided. Send it as `Authorization: Bearer coss_…`.",
        },
        WWW_AUTHENTICATE,
      );
    }

    const { rateLimiter, clientIp } = c.var;
    // Authenticate only after cheap shared limits. Hash the raw secret before it can reach Valkey.
    for (const request of [
      {
        buckets: ["api.authentication.key"] as const,
        subject: createHash("sha256").update(key).digest("hex").slice(0, 32),
      },
      {
        buckets: ["api.authentication.ip"] as const,
        // A process-wide fallback still bounds rotating credentials when IP trust is unconfigured.
        subject: clientIp ?? "unattributed",
      },
    ]) {
      const decision = await rateLimiter.consume(request);
      if (!decision.allowed) throw rateLimitError(decision, tooManyAuthentications);
    }
    const failures = clientIp
      ? { buckets: ["api.auth_failure"] as const, subject: clientIp }
      : null;
    if (failures) {
      const decision = await rateLimiter.consume({ ...failures, peek: true });
      if (!decision.allowed) throw rateLimitError(decision, tooManyFailures);
    }

    let result: AuthenticateResult;
    try {
      result = await authenticate(key, required);
    } catch (error) {
      // A database outage is not the caller's fault: 503 (retryable), never a 401.
      console.error(`[api] API key verification failed (request_id=${c.var.requestId}):`, error);
      throw new ApiError(503, {
        type: "api_error",
        code: "service_unavailable",
        message: "The API key could not be verified right now. Retry the request shortly.",
      });
    }

    if (!result.ok) {
      if (result.reason !== "invalid") c.set("attemptedAuth", result.context);
      if (result.reason === "suspended") {
        throw new ApiError(403, {
          type: "permission_error",
          code: "organization_suspended",
          message:
            "This organization is suspended, so its API keys can't be used. Contact support.",
        });
      }
      if (result.reason === "forbidden") {
        throw new ApiError(403, {
          type: "permission_error",
          code: "insufficient_permissions",
          message: `This API key does not have the required permission: ${permissionStrings(required).join(", ")}.`,
        });
      }
      if (failures) await rateLimiter.consume(failures);
      throw new ApiError(
        401,
        {
          type: "authentication_error",
          code: "invalid_api_key",
          message: "The API key is invalid, revoked or expired.",
        },
        WWW_AUTHENTICATE,
      );
    }

    c.set("auth", result.context);
    setTags({
      organization_id: result.context.organizationId,
      environment_id: result.context.environmentId,
      api_key_id: result.context.apiKeyId,
    });
    // The single place where the header overrides the organization's pinned version.
    const { versioning, requestedApiVersion } = c.var;
    c.set("apiVersion", versioning.resolve(requestedApiVersion ?? result.context.apiVersion));
    await next();
  });
}
