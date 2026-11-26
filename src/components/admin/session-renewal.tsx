"use client";

import { useId, useState, type FormEvent } from "react";
import { Button, Field, Input, Modal, Notice, api, errorMessage } from "./admin-ui";
import { useAdminLanguage } from "./admin-language";

/** Signs in again inside the workspace, so unsaved changes stay in this window when the session has expired. */
export function SessionRenewal({ team, onClose, onRenewed, onBackup }: { team: boolean; onClose: () => void; onRenewed: () => void; onBackup: () => void }) {
  const { t } = useAdminLanguage();
  const form = useId();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password, login: team ? login.trim() : undefined }) }); onRenewed(); }
    catch (reason) { setError(errorMessage(reason, t)); setBusy(false); }
  }
  return <Modal title={t("Bitte erneut anmelden")} description={t("Ihre Sitzung ist abgelaufen. Ihre ungespeicherten Änderungen bleiben in diesem Fenster erhalten. Melden Sie sich an und speichern Sie danach erneut.")}
    busy={busy} onClose={onClose} footer={<>
      <Button disabled={busy} onClick={onBackup}>{t("Browser-Entwurf sichern")}</Button>
      <Button type="submit" form={form} variant="primary" busy={busy} disabled={!password || team && !login.trim()}>{t("Anmelden")}</Button>
    </>}>
    <form id={form} onSubmit={submit}>
      {team && <Field label={t("Benutzername")}><Input name="username" required autoComplete="username" maxLength={64} value={login} onChange={event => setLogin(event.target.value)} /></Field>}
      <Field label={t("Passwort")}><Input required type="password" name="password" autoComplete="current-password" autoFocus value={password} onChange={event => setPassword(event.target.value)} /></Field>
      {error && <Notice tone="error">{error}</Notice>}
    </form>
  </Modal>;
}
