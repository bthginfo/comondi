import 'server-only';
import {randomUUID} from 'node:crypto';
import {mkdir,readFile,unlink,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {databaseConfigured} from './db';
import {useLocalMediaStore} from './database-policy';

/** Public path of images that a local installation keeps in `.data/media` instead of a Blob store. */
export const LOCAL_MEDIA_PREFIX='/api/media/local/';
const fileName=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

/** See useLocalMediaStore: only a local installation without Blob store and remote database. */
export function localMediaEnabled():boolean{
 return useLocalMediaStore(process.env,databaseConfigured());
}
function localFile(name:string){if(!fileName.test(name))throw new Error('Ungültiger Dateiname.');return resolve(process.cwd(),'.data','media',name);}
export async function putLocalMedia(bytes:Buffer):Promise<{url:string}>{
 const name=randomUUID()+'.webp';
 await mkdir(resolve(process.cwd(),'.data','media'),{recursive:true});
 await writeFile(localFile(name),bytes,{flag:'wx'});
 return {url:LOCAL_MEDIA_PREFIX+name};
}
export async function removeLocalMedia(url:string):Promise<void>{
 if(!url.startsWith(LOCAL_MEDIA_PREFIX))return;
 await unlink(localFile(url.slice(LOCAL_MEDIA_PREFIX.length))).catch(error=>{if(error?.code!=='ENOENT')throw error;});
}
export async function readLocalMedia(name:string):Promise<Buffer|null>{
 if(!fileName.test(name))return null;
 try{return await readFile(localFile(name));}catch{return null;}
}
