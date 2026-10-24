import { emailEnvShape, emailLinkEnvShape } from "@coss/email/env";
import { hookEnvShape } from "@coss/hooks/env";
import { sentryEnvShape } from "@coss/observability/env";
import { rateLimitEnvShape } from "@coss/ratelimit/env";
import { riskEnvShape } from "@coss/risk/env";
import { screeningEnvShape } from "@coss/screening/env";
import { smsEnvShape } from "@coss/sms/env";
import { webhookEnvShape } from "@coss/webhooks/env";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/** Validated at server start (src/index.ts). Tests never import this; they use `createApp()`. */
export const env = createEnv({
  server: {
    API_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32, "Generate one with `openssl rand -base64 32`."),
    BETTER_AUTH_URL: z.url(),
    // Public origin of this API (OpenAPI `servers`). Required in production: the request-origin
    // fallback sees the load balancer's http hop, not the client's https URL.
    API_PUBLIC_URL: process.env.NODE_ENV === "production" ? z.url() : z.url().optional(),
    // Origin of the open/click tracking links in emails (`/t/*`, served by this API whatever the
    // host). Defaults to API_PUBLIC_URL; production uses a separate domain (infra/aws/routing.ts).
    TRACKING_PUBLIC_URL: z.url().optional(),
    // Comma-separated browser origins allowed to call /v1 (the docs' API playground).
    API_CORS_ORIGINS: z
      .string()
      .default("https://coss.com")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .pipe(
        z.array(
          z.url().refine((origin) => new URL(origin).origin === origin, {
            message: "Use bare origins like https://coss.com (no path or trailing slash).",
          }),
        ),
      ),
    // Encrypts webhook endpoint signing secrets; must be the same value the worker uses.
    ...webhookEnvShape,
    ...emailEnvShape,
    // The live SMS provider's name (sends only enqueue here; Twilio's callbacks are verified with
    // each subaccount's own token, so the API needs no Twilio credentials).
    SMS_PROVIDER: smsEnvShape.SMS_PROVIDER,
    // Marketing email's links (the preference center is served here). Required in production.
    EMAIL_LINK_KEYS:
      process.env.NODE_ENV === "production"
        ? emailLinkEnvShape.EMAIL_LINK_KEYS.unwrap()
        : emailLinkEnvShape.EMAIL_LINK_KEYS,
    // Where Hooks portal session links point.
    ...hookEnvShape,
    ...rateLimitEnvShape,
    // Keys what risk assessments remember (velocity, duplicates, fraud reports).
    RISK_HASH_KEY:
      process.env.NODE_ENV === "production"
        ? riskEnvShape.RISK_HASH_KEY.unwrap()
        : riskEnvShape.RISK_HASH_KEY,
    // Risk's content classification (`ai`: SCREENING_MODEL through the AI Gateway).
    RISK_CLASSIFIER: riskEnvShape.RISK_CLASSIFIER,
    // VPN, proxy and relay data per address (`ipinfo`: IPinfo's privacy detection, a paid plan).
    RISK_IP_PRIVACY: riskEnvShape.RISK_IP_PRIVACY,
    IPINFO_PRIVACY_TOKEN: riskEnvShape.IPINFO_PRIVACY_TOKEN,
    SCREENING_MODEL: screeningEnvShape.SCREENING_MODEL,
    AI_GATEWAY_API_KEY: screeningEnvShape.AI_GATEWAY_API_KEY,
    // Error and performance monitoring; read by src/instrument.ts before this schema runs.
    ...sentryEnvShape,
    // The image's commit (Dockerfile build argument), Sentry's release.
    SENTRY_RELEASE: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
