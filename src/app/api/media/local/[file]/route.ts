import {localMediaEnabled,readLocalMedia} from '@/lib/local-media';

export const runtime='nodejs';
export const dynamic='force-dynamic';

/** Serves images of a local installation's media library (`.data/media`). Hosted sites use their Blob store. */
export async function GET(_request:Request,{params}:{params:Promise<{file:string}>}){
 if(!localMediaEnabled())return new Response('Not found',{status:404});
 const bytes=await readLocalMedia((await params).file);
 if(!bytes)return new Response('Not found',{status:404});
 return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/webp','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
}
