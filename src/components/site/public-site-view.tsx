import {PublicSiteClient} from './public-site-client';
import {ComondiPublicSite} from './comondi/comondi-public';
import type {SiteViewProps} from './site-view';

/** Discover critical CSS on the server; load creator JavaScript only when enabled. */
export function PublicSiteView(props:Pick<SiteViewProps,'page'|'site'|'cartHref'|'translations'|'consent'>){return props.page.sections.some(section=>section.type.startsWith('comondi-'))?<ComondiPublicSite {...props}/>:<PublicSiteClient {...props}/>;}
