/**
 * Error and performance monitoring (Sentry). Imported first by src/index.ts so `Bun.serve` is
 * instrumented before the server starts; reads `process.env` directly (src/env.ts validates the
 * same variables right after). Without SENTRY_DSN nothing is reported.
 */
import { sentryConfig, sentryOptions } from "@coss/observability";
import * as Sentry from "@sentry/bun";

const config = sentryConfig(process.env);
if (config) {
  Sentry.init({
    ...sentryOptions(config, "api"),
    release: process.env.SENTRY_RELEASE || undefined,
    integrations: [
      // Every package logs failures it handles with console.error (provider errors, fail-open
      // rate limiting, webhook deliveries…): each becomes an event with the request's tags.
      Sentry.captureConsoleIntegration({ levels: ["error"] }),
      Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
    ],
  });
}
