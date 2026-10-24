import { recordOrgAuditEvent } from "@coss/logs";
import type { Context } from "hono";
import type { AppEnv } from "./types.ts";

/**
 * Records a change an API key made (domains, webhook endpoints, suppressions) in the
 * organization's audit log, as the dashboard does for members. Called after the change succeeded;
 * a failure to record is logged, never returned (the change already happened).
 */
export async function recordApiAudit(
  c: Context<AppEnv>,
  input: {
    action: string;
    target?: { type: string; id: string | null; label?: string | null };
    /** Omit for organization-wide resources (domains). */
    environmentScoped?: boolean;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { auth, requestId, clientIp } = c.var;
  const scoped = input.environmentScoped ?? true;
  try {
    await recordOrgAuditEvent({
      organizationId: auth.organizationId,
      projectId: scoped ? auth.projectId : null,
      environmentId: scoped ? auth.environmentId : null,
      actor: { type: "api_key", id: auth.apiKeyId, label: auth.apiKeyId },
      action: input.action,
      target: input.target,
      metadata: { ...input.metadata, request_id: requestId },
      clientIp,
      userAgent: c.req.header("user-agent") ?? null,
    });
  } catch (error) {
    console.error(
      `[api] audit event ${input.action} not recorded (request_id=${requestId}):`,
      error,
    );
  }
}
