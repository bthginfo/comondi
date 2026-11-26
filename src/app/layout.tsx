import '@/lib/workspace/modules.css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import {bodyFont,bodyExtendedFont,creatorDisplayFont} from './fonts';
export const metadata: Metadata = { title: { default: 'co:mondi – Die Verbindung zwischen Welten', template: '%s' }, description: 'Agile Unternehmensberatung in München und Stuttgart. Projektmanagement, Transformation, Change und KI im Arbeitsalltag.', icons: { icon: '/comondi/favicon.svg' }, referrer: 'strict-origin-when-cross-origin' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#060a15' };
// The root layout reads no request data, so public pages stay static and are served from the CDN.
// English pages and the private workspaces set their document language on the page (DocumentLanguage, AdminLanguageProvider).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de" className={`${bodyFont.variable} ${bodyExtendedFont.variable} ${creatorDisplayFont.variable}`}><body>{children}</body></html>;
}
