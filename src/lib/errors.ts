/**
 * Narrowing helpers for values that genuinely arrive untyped.
 *
 * Edge-function responses and `catch` bindings are `unknown` at the boundary.
 * The codebase previously reached for `any` at each of those points, which
 * switches off checking for the whole expression rather than just the unknown
 * part. These keep the unsafety confined to one place and typed on the way out.
 */

/** Human-readable message from an unknown thrown value. */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  if (isRecord(err) && typeof err.message === "string" && err.message) return err.message;
  return fallback;
}

/** True for non-null plain objects — the shape guard the helpers below need. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Supabase edge functions signal failure with a 2xx body of `{ error: "..." }`
 * as well as with a thrown FunctionsHttpError, so both paths need checking.
 * Returns the message if the payload carries one.
 */
export function payloadError(payload: unknown): string | null {
  if (isRecord(payload) && typeof payload.error === "string" && payload.error) {
    return payload.error;
  }
  return null;
}
