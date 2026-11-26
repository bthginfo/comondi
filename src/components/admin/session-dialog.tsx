"use client";

import { useState, type FormEvent } from "react";
import { LOGIN_URL } from "@/lib/admin-request";
import { useAdminLanguage } from "./admin-language";
import { Button, Eye, EyeOff, Field, IconButton, Input, Modal, Notice } from "./admin-ui";

/** Sign in again without leaving the workspace. The interrupted request continues afterwards. */
export function SessionDialog({ staffLogin, onDone, onBackup }: { staffLogin?: string; onDone: (signedIn: boolean) => void; onBackup?: () => void }) {
  const { t } = useAdminLanguage();
  const [login, setLogin] = useState(staffLogin ?? "");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(LOGIN_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, login: staffLogin ? login : undefined }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut.");
      onDone(true);
    } catch (reason) {
      setError(reason instanceof TypeError ? "Die Verbindung konnte nicht hergestellt werden. Bitte prüfen Sie Ihr Netz und versuchen Sie es erneut." : reason instanceof Error ? reason.message : String(reason));
      setBusy(false);
    }
  }
  return <Modal title={t("Bitte erneut anmelden")} description={t("Ihre Sitzung ist abgelaufen. Ihre Änderungen sind noch in diesem Fenster und werden nach der Anmeldung gespeichert.")} busy={busy} onClose={() => onDone(false)}>
    <form className="cms-session-form" onSubmit={submit}>
      {staffLogin !== undefined && <Field label={t("Benutzername")}><Input name="username" autoComplete="username" required value={login} onChange={event => setLogin(event.target.value)} /></Field>}
      <Field label={t("Passwort")}><span className="cms-password">
        <Input type={visible ? "text" : "password"} name="password" autoComplete="current-password" autoFocus required value={password} onChange={event => setPassword(event.target.value)} />
        <IconButton label={visible ? t("Passwort verbergen") : t("Passwort anzeigen")} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton>
      </span></Field>
      {error && <Notice tone="error">{t(error)}</Notice>}
      <div className="cms-session-actions">
        {onBackup && <Button variant="quiet" disabled={busy} onClick={onBackup}>{t("Änderungen als Datei sichern")}</Button>}
        <span className="cms-spacer" />
        <Button disabled={busy} onClick={() => onDone(false)}>{t("Später")}</Button>
        <Button type="submit" variant="primary" busy={busy} disabled={!password || (staffLogin !== undefined && !login.trim())}>{t("Anmelden und fortfahren")}</Button>
      </div>
    </form>
  </Modal>;
}
