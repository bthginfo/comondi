import { adminMetadata } from '@/lib/admin-i18n/server';
import {redirect} from 'next/navigation';
import {getSession} from '@/lib/auth';
import {AdminLogin} from '@/components/admin/admin-login';
import {publishedContent} from '@/lib/content';
import {staffLogin} from '@/lib/team/model';
import {brandCandidates, cmsAccentVariables, deriveCmsAccent} from '@/lib/cms-accent';

export function generateMetadata() {
  return adminMetadata('/admin/login');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ konto?: string | string[] }> }) {
  if (await getSession()) redirect('/admin');
  const config = await publishedContent().then(content => content.config).catch(() => undefined);
  const siteName = config?.name;
  const accentStyle = cmsAccentVariables(deriveCmsAccent(config ? brandCandidates(config.theme, config.designVariant ?? 1) : []));
  const login = staffLogin.safeParse((await searchParams).konto);
  return <AdminLogin siteName={siteName} accentStyle={accentStyle} teamLogin={login.success ? login.data : undefined} />;
}
