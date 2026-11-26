"use client";

import { useContext, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle, RotateCcw } from "lucide-react";

import {SiteInteractionContext} from './editable';
import type {ContactFormCopy, SiteLanguage} from '@/lib/types';
import {readContactContext} from '@/lib/contact-context';
import {reportConfirmedOutcome} from '@/lib/analytics/client';
/** `askPhone`: the optional callback number is asked only when the site itself can be reached by phone. */
export function ContactForm({ editable = false, copy, informal = false, compact = false, kind, language = "de", askPhone = true }: {
  editable?: boolean; copy?: ContactFormCopy; informal?: boolean; compact?: boolean; language?: SiteLanguage; kind?: "partnership"; askPhone?: boolean;
}) {
  const {isolated}=useContext(SiteInteractionContext);
  const english = language === "en";
  const t = (de: string, en: string) => english ? en : de;
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [extraOpen, setExtraOpen] = useState(false);
  const sending = useRef(false);
  const success = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (editable) return;
    const context = readContactContext(window.location.search);
    setSubject(context.subject);
    setMessage(context.message);
    if (context.subject) setExtraOpen(true);
  }, [editable]);
  useEffect(() => { if (compact && status === "success") success.current?.focus(); }, [compact, status]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editable || sending.current) return;
    if(isolated){setStatus("success");return;}
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    sending.current = true;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), email: data.get("email"), phone: data.get("phone"),
          subject: compact ? String(data.get("subject") || "").trim() || undefined : data.get("subject"), message: data.get("message"), kind,
          consent: data.get("consent") === "on", website: data.get("website") ?? "", startedAt,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true) throw new Error(english ? "Your message could not be sent. Check the fields and try again." : result?.error ?? "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
      void reportConfirmedOutcome(result.statisticsProof);
      setStatus("success");
      form.reset();
      setMessage("");
    } catch (reason) {
      setError(reason instanceof TypeError ? t("Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.", "Check your internet connection and try again.") : reason instanceof Error ? reason.message : t("Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.", "Your message could not be sent. Please try again."));
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }
  if(isolated)return <div className="ws-contact-form"><p>Fiktives Kontaktbeispiel. Hier werden keine Nachrichten oder personenbezogenen Angaben versendet.</p><button type="button" className="ws-button" onClick={()=>setStatus("success")}>{status==="success"?"Demo-Anfrage lokal vorgemerkt":"Demo-Anfrage ausprobieren"}</button></div>;
  if (status === "success") return <div className="ws-contact-success" role="status" aria-live="polite">
    <span className="ws-success-icon"><Check size={30} /></span><h3 ref={success} tabIndex={compact ? -1 : undefined}>{copy?.successHeading||t(informal?"Danke für deine Nachricht.":"Vielen Dank für Ihre Nachricht.", "Thank you for your message.")}</h3>
    <p>{copy?.successText||t(informal?"Deine Anfrage ist angekommen. Wir melden uns bei dir.":"Ihre Anfrage ist bei uns eingegangen. Wir melden uns bei Ihnen.", "We received your message and will get back to you.")}</p>
    <button className="ws-text-button" type="button" onClick={() => setStatus("idle")}>{t("Weitere Nachricht schreiben", "Write another message")} <RotateCcw size={17} /></button>
  </div>;
  const subjectField = <label htmlFor={`${id}-subject`}><span>{copy?.subjectLabel || t(informal ? "Dein Vorhaben" : "Ihr Anliegen", "Subject")}{!compact && <> <span aria-hidden="true">*</span></>}</span>
    <input id={`${id}-subject`} name="subject" required={!compact} maxLength={200} placeholder={t("Worum geht es?", "What’s it about?")} value={subject} onChange={event => setSubject(event.target.value)} />
  </label>;
  const phoneField = <>{askPhone && <label htmlFor={`${id}-phone`}><span>{t("Telefon", "Phone")} {!compact && <span className="ws-optional">(optional)</span>}</span>
    <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={80} placeholder={t("Für einen Rückruf", "For a callback")} />
  </label>}</>;
  return <form className="ws-contact-form" onSubmit={submit} aria-busy={status === "sending"} aria-label={kind === "partnership" ? t("Kooperationsanfrage", "Partnership enquiry") : t("Kontaktformular", "Contact form")}>
    {editable && <p className="ws-form-editor-note">Kontaktformular · Anfragen werden im Posteingang gespeichert.</p>}
    <fieldset disabled={editable || status === "sending"}>
      <div className="ws-form-row"><label htmlFor={`${id}-name`}><span>{copy?.nameLabel||t(informal?"Dein Name":"Ihr Name", "Your name")} <span aria-hidden="true">*</span></span><input id={`${id}-name`} name="name" autoComplete="name" required maxLength={150} placeholder={t("Vor- und Nachname", "First and last name")} /></label>
        <label htmlFor={`${id}-email`}><span>{t("E-Mail-Adresse", "Email address")} <span aria-hidden="true">*</span></span><input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} placeholder={t("name@beispiel.de", "name@example.com")} /></label></div>
      {!compact && <div className={askPhone ? "ws-form-row" : "ws-form-row ws-form-row--single"}>{phoneField}{subjectField}</div>}
      <label htmlFor={`${id}-message`}><span>{copy?.messageLabel||t(informal?"Deine Nachricht":"Ihre Nachricht", "Your message")} <span aria-hidden="true">*</span></span><textarea id={`${id}-message`} name="message" value={message} onChange={event => setMessage(event.target.value)} rows={4} required minLength={15} maxLength={12000} placeholder={copy?.messagePlaceholder||t(informal?"Erzähl uns kurz von deiner Idee.":"Beschreiben Sie uns Ihr Anliegen in wenigen Sätzen.", "How can we help?")} /></label>
      {compact && <details className="ws-contact-optional" open={extraOpen} onToggle={event => setExtraOpen(event.currentTarget.open)}>
        <summary>{askPhone ? t("Thema und Rückrufnummer ergänzen (optional)", "Add a topic and callback number (optional)") : t("Thema ergänzen (optional)", "Add a topic (optional)")}</summary>
        <div className={askPhone ? "ws-form-row" : "ws-form-row ws-form-row--single"}>{subjectField}{phoneField}</div>
      </details>}
      <div className="ws-honeypot" aria-hidden="true"><label htmlFor={`${id}-website`}>Website<input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="ws-checkbox-label" htmlFor={`${id}-consent`}><input id={`${id}-consent`} name="consent" type="checkbox" required /><span>{english ? <>I’ve read the <a href="/en/privacy">privacy notice</a> about how my information is handled.</> : <>Ich habe die <a href="/datenschutz">Datenschutzhinweise</a> zur Verarbeitung meiner Angaben gelesen.</>} <span aria-hidden="true">*</span></span></label>
      <p className="ws-form-help">{copy?.helpText||t(informal?"Mit * markierte Felder brauchen wir. Bitte sende keine vertraulichen Dokumente oder Zugangsdaten.":"Mit * gekennzeichnete Felder sind erforderlich. Bitte senden Sie über das Formular keine vertraulichen Dokumente oder Zugangsdaten.", "Fields marked * are required. Please leave out confidential documents and account details.")}</p>
      {error && <p className="ws-form-error" role="alert">{error}</p>}
      <button className="ws-button ws-button-dark" type="submit" disabled={editable || status === "sending"}>{status === "sending" ? <>{t("Wird gesendet", "Sending")} <LoaderCircle size={18} className="ws-spin" /></> : <>{copy?.submitLabel||t("Nachricht senden", "Send message")} <ArrowUpRight size={20} /></>}</button>
    </fieldset>
  </form>;
}
