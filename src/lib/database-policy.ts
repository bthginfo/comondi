export function useRemoteDatabase(env: Record<string, string | undefined>): boolean {
  if (!env.DATABASE_URL) return false;
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') return env.WS_USE_REMOTE_DATABASE === '1';
  return true; // Explicit maintenance and migration scripts.
}

/**
 * Local installations without their own Blob store keep editor uploads in `.data/media`.
 * Hosted deployments (VERCEL) and remote databases always use the website's own Blob store.
 */
export function useLocalMediaStore(env: Record<string, string | undefined>, remoteDatabase: boolean): boolean {
  return !env.BLOB_READ_WRITE_TOKEN && !env.VERCEL && !remoteDatabase;
}
