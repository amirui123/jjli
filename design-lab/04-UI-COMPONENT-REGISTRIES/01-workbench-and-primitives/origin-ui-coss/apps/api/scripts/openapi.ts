/**
 * Regenerates `apps/api/openapi.json`, the committed OpenAPI document the docs site renders.
 * `test/openapi-snapshot.test.ts` fails when it is stale.
 *
 *   bun run openapi:generate
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { OPENAPI_SNAPSHOT_PATH, renderOpenApiSnapshot } from "../src/openapi-snapshot.ts";

writeFileSync(OPENAPI_SNAPSHOT_PATH, renderOpenApiSnapshot());
console.log(`Wrote ${fileURLToPath(OPENAPI_SNAPSHOT_PATH)}`);
