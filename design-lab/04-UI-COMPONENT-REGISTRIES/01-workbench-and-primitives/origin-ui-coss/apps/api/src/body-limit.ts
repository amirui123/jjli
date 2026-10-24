import type { Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { errorResponse, payloadTooLarge } from "./errors.ts";

/** Every route except the send routes (`POST /v1/emails`, `POST /v1/emails/batch`). */
export const BODY_LIMIT_BYTES = 5 * 1024 * 1024;
/**
 * The send routes: room for 25 MB of attachments once base64-encoded (4/3), plus the body. A batch
 * shares this limit across all of its emails.
 */
export const SEND_BODY_LIMIT_BYTES = 40 * 1024 * 1024;

export function limitBody(maxSize: number) {
  return bodyLimit({ maxSize, onError: (c) => errorResponse(c, payloadTooLarge(maxSize)) });
}

/** The send routes enforce their own, larger limit after authenticating the caller. */
export function hasOwnBodyLimit(c: Context): boolean {
  return (
    c.req.method === "POST" && (c.req.path === "/v1/emails" || c.req.path === "/v1/emails/batch")
  );
}
