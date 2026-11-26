"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import type { SiteConfig } from "@/lib/types";
import { ContentLink, safeHref } from "../editable";
import { styles } from "./styles";

/** The co:mondi mark, or the logo chosen in the CMS design area (shown in its own colours, optionally with the name). */
export function ComondiLogo({ site, width, height }: { site: SiteConfig; width: number; height: number }) {
  const logo = site.theme.logo;
  if (!logo?.url) return <img src="/comondi/logo.svg" width={width} height={height} alt={site.name} />;
  const showName = logo.showName !== false;
  return <><img className={styles.customLogo} src={logo.url} alt={showName ? "" : logo.alt || site.name} />{showName && <span className={styles.brandName}>{site.name}</span>}</>;
}

export function ComondiNavigation({ site, slug, editable, motionEnabled, paused, onToggleMotion }: {
  site: SiteConfig;
  slug: string;
  editable?: boolean;
  motionEnabled: boolean;
  paused: boolean;
  onToggleMotion: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const path = `/${slug}`;
  const cta = site.footer?.ctaHref || "/kontakt";
  const ctaLabel = site.footer?.ctaLabel || "Kontakt";
  const current = (href: string) => href === path ? "page" : undefined;

  useEffect(() => {
    if (!open) return;
    const viewport = matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => { if (viewport.matches) dialog.current?.close(); };
    const documentStyle = document.documentElement.style;
    const originalOverflow = documentStyle.overflow;
    documentStyle.overflow = "hidden";
    viewport.addEventListener("change", closeOnDesktop);
    return () => {
      viewport.removeEventListener("change", closeOnDesktop);
      documentStyle.overflow = originalOverflow;
    };
  }, [open]);

  const show = () => {
    if (!dialog.current || dialog.current.open) return;
    dialog.current.showModal();
    setOpen(true);
  };
  const dismissOnNavigation = (event: MouseEvent<HTMLElement>) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && (event.target as Element).closest("a[href]")) dialog.current?.close();
  };
  const brand = () => <ContentLink href="/" editable={editable} className={styles.brand} label={`${site.name} – Startseite`}>
    <ComondiLogo site={site} width={128} height={46} />
  </ContentLink>;
  const links = (mobile = false) => site.navigation.map((link, index) => {
    const parent = link.href !== "/" && path.startsWith(`${link.href}/`);
    return <ContentLink key={`${link.href}-${index}`} href={link.href} current={current(link.href)} editable={editable} className={`${styles.navLink}${parent ? ` ${styles.navParent}` : ""}`}>
      {link.label}{mobile && <ArrowRight size={20} aria-hidden="true" />}
    </ContentLink>;
  });

  return <header className={styles.header}>
    <div className={styles.headerInner}>
      {brand()}
      <nav className={styles.desktopNav} aria-label="Hauptnavigation">{links()}</nav>
      <div className={styles.headerActions}>
        <ContentLink href={cta} current={current(safeHref(cta))} editable={editable} className={styles.headerCta}>
          {ctaLabel}<ArrowUpRight size={16} aria-hidden="true" />
        </ContentLink>
        <button type="button" className={styles.menuToggle} onClick={show} aria-expanded={open} aria-controls={id} aria-haspopup="dialog" aria-label="Menü öffnen">
          <Menu size={24} aria-hidden="true" />
        </button>
      </div>
    </div>
    <dialog id={id} ref={dialog} className={styles.mobileMenu} onClose={() => setOpen(false)} aria-label="Menü"
      onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className={styles.mobileMenuSheet}>
        <div className={styles.mobileMenuTop} onClick={dismissOnNavigation}>
          {brand()}
          <button type="button" className={styles.menuClose} aria-label="Menü schließen" onClick={() => dialog.current?.close()}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        <nav className={styles.mobileMenuLinks} aria-label="Hauptnavigation" onClick={dismissOnNavigation}>
          {links(true)}
          {!site.navigation.some(link => link.href === cta) && <ContentLink href={cta} current={current(safeHref(cta))} editable={editable} className={styles.mobileCta}>
            {ctaLabel}<ArrowUpRight size={21} aria-hidden="true" />
          </ContentLink>}
        </nav>
        {!editable && motionEnabled && <button type="button" className={styles.menuMotion} onClick={onToggleMotion}>
          {paused ? "Bewegung fortsetzen" : "Bewegung pausieren"}
        </button>}
      </div>
    </dialog>
  </header>;
}
