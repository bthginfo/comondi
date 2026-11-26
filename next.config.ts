import type { NextConfig } from 'next';

// The image optimizer only accepts this website's own Blob store, so it cannot be used to process images from other stores.
const blobStore = /^vercel_blob_rw_([a-z\d]+)_/i.exec(process.env.BLOB_READ_WRITE_TOKEN || '')?.[1]?.toLowerCase() || 'lzivon9se7zrnxwu';

const config: NextConfig = {
  async redirects() { return [
    {source:"/home.html",destination:"/",permanent:true},
    {source:"/whats-new.html",destination:"/aktuelles",permanent:true},
    {source:"/impressum.html",destination:"/impressum",permanent:true},
    {source:"/datenschutz.html",destination:"/datenschutz",permanent:true},
    {source:"/news/:slug.html",destination:"/aktuelles/:slug",permanent:true},
  ]; },
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: `${blobStore}.public.blob.vercel-storage.com`, pathname: '/**' }], formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ] },
      // OAuth return documents and the CMS (src/proxy.ts) generate a stricter per-request nonce policy.
      // A matching static Next header would overwrite that response policy.
      { source: '/:path((?!api/social/connectors/callback/|admin/|admin$).*)', headers: [
        { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'" },
      ] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }, { key: 'Cache-Control', value: 'private, no-store' }, { key: 'Referrer-Policy', value: 'no-referrer' }] },
      { source: '/coach/:path(access|edit|view)/:rest*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }, { key: 'Cache-Control', value: 'private, no-store' }, { key: 'Referrer-Policy', value: 'no-referrer' }] },
      { source: '/members/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }, { key: 'Cache-Control', value: 'private, no-store' }, { key: 'Referrer-Policy', value: 'no-referrer' }] },
      { source: '/workspace-sw.js', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }, {key:'Referrer-Policy',value:'no-referrer'}] },
      { source: '/demo/:creator/:path*', headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'" },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ] },
    ];
  },
};
export default config;
