/**
 * Browser-local recovery copy of unsaved CMS changes.
 *
 * The copy is written only while changes are unsaved and removed after saving. On the next visit it is
 * offered for restoring only if the saved draft has not changed in the meantime (same revision);
 * otherwise restoring could silently replace newer work, so only a download is offered.
 */
export const DRAFT_RECOVERY_KEY = "ws-admin-unsaved-draft-v1";
export const DRAFT_RECOVERY_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

export interface DraftRecovery<T = unknown> {
  format: "ws-draft-recovery-v1";
  revision: number;
  savedAt: string;
  content: T;
}

export type RecoveryDecision = "none" | "restore" | "outdated";

export function recoveryRecord<T>(content: T, revision: number, now = new Date()): DraftRecovery<T> {
  return { format: "ws-draft-recovery-v1", revision, savedAt: now.toISOString(), content };
}

function looksLikeContent(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const content = value as { config?: unknown; pages?: unknown };
  return Boolean(content.config && typeof content.config === "object" && Array.isArray(content.pages));
}

export function parseRecovery(raw: string | null | undefined): DraftRecovery | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<DraftRecovery>;
    if (value?.format !== "ws-draft-recovery-v1" || !Number.isInteger(value.revision) || typeof value.savedAt !== "string" ||
        Number.isNaN(Date.parse(value.savedAt)) || !looksLikeContent(value.content)) return null;
    return value as DraftRecovery;
  } catch {
    return null;
  }
}

export function recoveryDecision(record: DraftRecovery | null, serverRevision: number, serverDraft: unknown, now = Date.now()): RecoveryDecision {
  if (!record) return "none";
  if (now - Date.parse(record.savedAt) > DRAFT_RECOVERY_MAX_AGE) return "none";
  if (JSON.stringify(record.content) === JSON.stringify(serverDraft)) return "none";
  return record.revision === serverRevision ? "restore" : "outdated";
}
