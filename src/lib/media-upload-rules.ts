/** Upload limits of the editor media library; the server enforces the same rules. */
export const MEDIA_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MEDIA_UPLOAD_LIMIT = 4 * 1024 * 1024;

/** Explains before any transfer why a file cannot be uploaded (undefined when it can). */
export function uploadProblem(file: { type: string; size: number }): string | undefined {
  if (!(MEDIA_UPLOAD_TYPES as readonly string[]).includes(file.type)) return "Dieses Format wird nicht unterstützt. Bitte wählen Sie ein JPG-, PNG- oder WebP-Bild.";
  if (!file.size || file.size > MEDIA_UPLOAD_LIMIT) return "Die Datei ist größer als 4 MB. Bitte verkleinern Sie sie vor dem Hochladen.";
  return undefined;
}
