import type { FeatureKey } from "@coss/billing/gate";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types.ts";

/**
 * Refuses (402 `billing_error`) when the organization's plan lacks `feature`. After
 * `requireApiKey`: the plan is the key's organization's.
 */
export function requirePlanFeature(feature: FeatureKey) {
  return createMiddleware<AppEnv>(async (c, next) => {
    await c.var.plans?.requireFeature(c.var.auth.organizationId, feature);
    await next();
  });
}
