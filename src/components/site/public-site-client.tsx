"use client";

import dynamic from 'next/dynamic';
import type {SiteViewProps} from './site-view';

// Both renderers load on demand. Pages built with a dedicated design such as co:mondi share this route,
// so a static import would ship the generic renderer and all of its design variants with every public page.
const SiteView=dynamic(()=>import('./site-view').then(module=>module.SiteView));
const CreatorPublicSiteView=dynamic(()=>import('@/components/creator/creator-public-site').then(module=>module.CreatorPublicSiteView));

export function PublicSiteClient(props:Pick<SiteViewProps,'page'|'site'|'cartHref'|'translations'|'consent'>){return props.site.modules?.creator?.enabled?<CreatorPublicSiteView {...props}/>:<SiteView {...props}/>;}
