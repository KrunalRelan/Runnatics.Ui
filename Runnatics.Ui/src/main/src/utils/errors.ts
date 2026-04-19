/**
 * Pull a user-facing string out of an unknown error.
 *
 * Backends occasionally return `{ error: { code, message } }` — passing that
 * raw object to React state causes "Objects are not valid as a React child"
 * (minified #31). This helper walks common server-response shapes and only
 * returns a value once it's confirmed to be a non-empty string.
 */
export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const anyErr = err as any;
  const candidates: unknown[] = [
    anyErr?.response?.data?.message,
    anyErr?.response?.data?.error?.message,
    anyErr?.response?.data?.error,
    anyErr?.response?.data?.title,
    anyErr?.userMessage,
    anyErr?.message,
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c;
  }
  return fallback;
}
