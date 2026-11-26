import { NextResponse, type NextRequest } from 'next/server';

/**
 * The CMS shows inquiries and drafts, so it only runs scripts that carry a fresh per-request nonce.
 * Next.js adds the nonce to its own scripts; chunks loaded later are allowed through 'strict-dynamic'.
 * Only /admin is matched: public pages stay static and are served without running this proxy.
 */
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = [
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  const headers = new Headers(request.headers);
  headers.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
