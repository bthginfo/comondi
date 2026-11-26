import 'server-only';
import {put,del} from '@vercel/blob';
import {AppError,deleteRecord,getRecord,hasRetainedMediaReference,setRecord} from './db';
import {createMediaOperations,MediaOperationError} from './media-operations';
import type {MediaAsset} from './types';
import {LOCAL_MEDIA_PREFIX,localMediaEnabled,putLocalMedia,removeLocalMedia} from './local-media';
// Local installations without a Blob store keep uploads in .data/media, so the media library works end to end.
const media=createMediaOperations({
 configured:()=>Boolean(process.env.BLOB_READ_WRITE_TOKEN)||localMediaEnabled(),
 put:async(path,bytes)=>localMediaEnabled()?putLocalMedia(bytes):put(path,bytes,{access:'public',addRandomSuffix:true,contentType:'image/webp',token:process.env.BLOB_READ_WRITE_TOKEN}),
 removeBlob:async url=>{if(url.startsWith(LOCAL_MEDIA_PREFIX)){await removeLocalMedia(url);return;}await del(url,{token:process.env.BLOB_READ_WRITE_TOKEN});},
 save:async asset=>setRecord('media',asset.id,asset),find:async id=>getRecord<MediaAsset>('media',id),
 referenced:hasRetainedMediaReference,removeRecord:async id=>deleteRecord('media',id)
});
async function mapped<T>(operation:()=>Promise<T>){try{return await operation();}catch(error){if(error instanceof MediaOperationError)throw new AppError(error.message,error.status);throw error;}}
export function uploadEditorMedia(file:File,alt=''){return mapped(()=>media.upload(file,alt));}
export function deleteEditorMedia(id:string){return mapped(()=>media.remove(id));}
