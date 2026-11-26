/**
 * Admin requests that survive an expired session.
 *
 * A 401 from a CMS action no longer navigates away from unsaved work. When the workspace has
 * registered a re-authentication handler (the sign-in dialog), the request waits for it and is
 * sent once more. Concurrent requests share one dialog.
 */
export type Reauthenticate = () => Promise<boolean>;

export interface SessionGate {
  register(handler: Reauthenticate | null): void;
  /** Resolves true after a successful new sign-in, false when cancelled or unavailable. */
  reauthenticate(): Promise<boolean>;
  readonly available: boolean;
}

export function createSessionGate(): SessionGate {
  let handler: Reauthenticate | null = null;
  let pending: Promise<boolean> | null = null;
  return {
    register(next) { handler = next; },
    reauthenticate() {
      if (!handler) return Promise.resolve(false);
      pending ??= handler().catch(() => false).finally(() => { pending = null; });
      return pending;
    },
    get available() { return handler !== null; },
  };
}

export const LOGIN_URL = "/api/admin/login";

/** Sends a request; on 401 asks the gate for a new sign-in and repeats the request exactly once. */
export async function fetchWithSession(
  url: string,
  init: RequestInit,
  gate: SessionGate,
  send: (url: string, init: RequestInit) => Promise<Response> = fetch,
): Promise<{ response: Response; reauthenticated: boolean }> {
  const response = await send(url, init);
  if (response.status !== 401 || url === LOGIN_URL || !gate.available) return { response, reauthenticated: false };
  if (!(await gate.reauthenticate())) return { response, reauthenticated: false };
  return { response: await send(url, init), reauthenticated: true };
}
