"use client";

import {useContext,useEffect,useId,useRef,useState,type CSSProperties} from 'react';
import type {CreatorSectionProps} from '@/lib/creator/types';
import type {CheckoutResult,CommerceInventory} from '@/lib/commerce/contracts';
import {ContentLink,EditableImage,EditableText,SiteInteractionContext} from '@/components/site/editable';
import {useSectionHeadingLevel} from '@/components/site/heading-level';
import {CheckoutAttemptLimitError,clearCheckoutAttempt,markCheckoutAttemptSubmitted,prepareCheckoutAttempt,readCheckoutAttempt,saveCheckoutAttempt,type CheckoutAttempt} from '@/lib/commerce/checkout-attempt';
import {buttonInk,defaultDocumentDesign} from '@/lib/business/design';
import {quoteCommerce,DELIVERY_COUNTRIES} from '@/lib/commerce/pricing';
import {categorySlug,productSlug,shopSearchPath} from '@/lib/commerce/route-pages';
import {TEMPLATE_CONTENT_ID} from '@/lib/route-template-keys';
import {WITHDRAWAL_PATH,WITHDRAWAL_LABEL} from '@/lib/commerce/withdrawal';
import {creatorMoney,useCreatorCart} from './shop/cart-state';
import styles from './commerce.module.css';

export function CommerceStorefront({section,site,editable,onChange}:CreatorSectionProps){
  const config=site.modules?.commerce;
  const {isolated}=useContext(SiteInteractionContext);
  const {state,ready,storageKey,add,quantity,reset}=useCreatorCart();
  const [country,setCountry]=useState(''),[group,setGroup]=useState('');
  const [variants,setVariants]=useState<Record<string,string>>({});
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[added,setAdded]=useState('');
  const [inventory,setInventory]=useState<Pick<CommerceInventory,'productId'|'available'>[]|null>(null);
  const [attempt,setAttempt]=useState<CheckoutAttempt|null>(null),[terminal,setTerminal]=useState(false);
  const inFlight=useRef(false),quantityId=useId(),heading=useSectionHeadingLevel(section.id);
  useEffect(()=>{
    if(editable||isolated||!config?.enabled)return;
    try{setAttempt(readCheckoutAttempt(sessionStorage));}catch{}
    const controller=new AbortController();fetch('/api/commerce/catalog',{cache:'no-store',signal:controller.signal}).then(async response=>{if(response.ok)setInventory((await response.json()).inventory);}).catch(()=>{});
    return()=>controller.abort();
  },[editable,isolated,config?.enabled,site.name]);
  if(!config?.enabled)return editable?<p>Der Shop ist ausgeschaltet. Produkte und Einrichtung findest du unter „Shop“ im CMS.</p>:null;
  if(isolated)return <p>Dieses Beispiel verwendet ausschließlich den lokalen Demo-Warenkorb.</p>;
  const c=section.content,mode=c.caption||'catalog';
  const colors=defaultDocumentDesign(site.name.slice(0,100),site.theme.primary);
  if(mode==='confirmation')return <div className={styles.store} style={!site.modules?.creator?.enabled?{'--ws-accent':colors.accent,'--ws-ink':buttonInk(colors.accent)} as CSSProperties:undefined}><p>{editable?'Die echte Bestellbestätigung wird nach der Zahlungsprüfung automatisch unter /checkout/ergebnis angezeigt. Wähle für diesen Abschnitt Produktübersicht, einzelnes Produkt oder Warenkorb.':'Den aktuellen Bestellstatus findest du über deinen persönlichen Bestelllink.'}</p></div>;
  const active=config.products.filter(p=>p.active);
  const routeLayout=section.id==='shop-dynamic-content'||section.id===TEMPLATE_CONTENT_ID;
  const detail=routeLayout&&mode==='product';
  const search=mode==='search',category=mode==='category';
  const selectedIds=new Set(c.items?.map(item=>item.productId));
  const products=mode==='product'||search||category
    ? active.filter(product=>selectedIds.has(product.id))
    : active.filter(product=>!group||product.groupId===group);
  const groups=config.productGroups?.filter(entry=>active.some(product=>product.groupId===entry.id)) || [];
  const palette=section.design;
  const style={
    ...(!site.modules?.creator?.enabled?{'--ws-accent':colors.accent,'--ws-ink':buttonInk(colors.accent)}:{}),
    ...(routeLayout?{
      '--shop-bg':palette.background||(palette.theme==='dark'?'#14211f':palette.theme==='accent'?'var(--ws-accent)':palette.theme==='soft'?'var(--ws-palette-surface)':'var(--ws-palette-background)'),
      '--shop-fg':palette.textColor||(palette.theme==='dark'?'#f8f8f3':palette.theme==='accent'?buttonInk(colors.accent):'var(--ws-palette-text)'),
      '--shop-radius':palette.radius+'px',
      '--shop-width':palette.width==='normal'?'950px':palette.width==='full'?'100%':'1240px',
      '--shop-pad':palette.spacing==='compact'?'clamp(20px,4cqi,56px)':palette.spacing==='airy'?'clamp(48px,9cqi,120px)':'clamp(30px,6cqi,90px)',
      '--shop-scale':palette.fontScale,
      '--shop-title-font':palette.headingFont==='sans'?'var(--font-body)':'var(--font-display)',
      '--shop-align':palette.align==='center'?'center':'left',
      '--shop-columns':palette.columns,
      ...(palette.accentColor?{'--ws-accent':palette.accentColor,'--ws-ink':buttonInk(palette.accentColor)}:{})
    }:{})
  } as CSSProperties;
  const lines=state.lines.map(line=>({...line,product:active.find(p=>p.id===line.productId)})).filter(line=>line.product);
  const physical=lines.some(line=>line.product!.kind==='physical'),countries=[...new Set((config.shippingZones||[]).filter(z=>z.active).flatMap(z=>z.countries))];
  const selectedCountry=physical&&config.shippingZones?.length?(countries.includes(country)?country:countries.length===1?countries[0]:undefined):undefined;
  let quote:ReturnType<typeof quoteCommerce>|null=null,quoteError='';if(state.lines.length)try{quote=quoteCommerce(config,state.lines,selectedCountry);}catch(e){quoteError=e instanceof Error?e.message:'Bitte den Warenkorb prüfen.';}
  const subtotal=quote?.subtotalCents??lines.reduce((sum,line)=>sum+line.quantity*line.product!.priceCents,0),shipping=quote?.shippingCents;
  const available=(id:string,capacity?:number)=>inventory?.find(p=>p.productId===id)?.available??(capacity===0?0:undefined);
  async function checkout(restart=false){
    if(editable||isolated||inFlight.current||!lines.length||!quote)return;inFlight.current=true;setError('');setBusy(true);
    try{
      if(restart){clearCheckoutAttempt(sessionStorage);setTerminal(false);}
      const items=lines.map(({productId,quantity,variant})=>({productId,quantity,variant}));
      let current:CheckoutAttempt;
      try{current=markCheckoutAttemptSubmitted(sessionStorage,prepareCheckoutAttempt(sessionStorage,items,storageKey,undefined,selectedCountry));}catch(reason){if(reason instanceof CheckoutAttemptLimitError)throw reason;throw new Error('Dein Browser kann die angefangene Kasse nicht sicher speichern. Bitte erlaube den Website-Speicher und versuche es erneut.');}
      setAttempt(current);
      const response=await fetch('/api/commerce/checkout',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':current.key},body:JSON.stringify({items,country:selectedCountry,previousKey:current.previousKey,previousKeys:current.previousKeys})});
      const result=await response.json() as CheckoutResult&{error?:string;code?:string};
      if(!response.ok){if(result.code==='OUT_OF_STOCK')fetch('/api/commerce/catalog',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(r=>r&&setInventory(r.inventory)).catch(()=>{});throw new Error(result.error||'Die Kasse konnte nicht geöffnet werden. Bitte versuche dieselbe Kasse erneut.');}
      if(!result.statusUrl?.startsWith('/checkout/ergebnis?'))throw new Error('Der Bestellzugang konnte nicht geprüft werden. Bitte dieselbe Kasse erneut öffnen.');
      const saved={...current,orderId:result.orderId,statusUrl:result.statusUrl};saveCheckoutAttempt(sessionStorage,saved);setAttempt(saved);
      if(result.state==='terminal'){setTerminal(true);setError('Diese Kasse ist beendet. Du kannst die Bestellung prüfen oder ausdrücklich eine neue Kasse starten.');return;}
      if(result.state!=='open'){window.location.assign(result.statusUrl);return;}
      const url=new URL(result.url||'');if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com'||url.username||url.password||url.port)throw new Error('Die Checkout-Adresse konnte nicht geprüft werden. Bitte dieselbe Kasse erneut öffnen.');
      window.location.assign(url.href);
    }catch(reason){setError(reason instanceof Error?reason.message:'Die Kasse ist gerade nicht erreichbar. Bitte dieselbe Kasse erneut versuchen.');}
    finally{inFlight.current=false;setBusy(false);}
  }
  return <div className={styles.store + (routeLayout?' '+styles.route:'')} style={style}>
    <div className={routeLayout?styles.routeInner:undefined}>
    <header className={styles.intro}>
      <EditableText as={heading} value={c.heading} editable={editable} onChange={value=>onChange?.({...section,content:{...c,heading:value}})}/>
      <EditableText value={c.text} editable={editable} onChange={value=>onChange?.({...section,content:{...c,text:value}})}/>
    </header>
    {mode!=='cart'&&mode!=='product'&&<form className={styles.search} action={shopSearchPath} role="search" onSubmit={editable?event=>event.preventDefault():undefined}>
      <label htmlFor={quantityId+'-search'}>Produkte suchen</label>
      <div><input type="search" id={quantityId+'-search'} name="q" placeholder="Produktname oder Stichwort" defaultValue={c.searchTerm||''} maxLength={150} disabled={editable}/>
      <button type="submit" disabled={editable}>Suchen</button></div>
    </form>}
    {mode!=='cart'&&groups.length>0&&<nav className={styles.categoryLinks} aria-label="Shop-Kategorien">{groups.map(item=>
      <ContentLink key={item.id} href={'/'+categorySlug(item)} editable={editable}>{item.name}</ContentLink>
    )}</nav>}
    {mode!=='cart'&&<>{mode==='catalog'&&config.productGroups?.length?<nav className={styles.groupFilters} aria-label="Produktgruppen"><button type="button" aria-pressed={!group} onClick={()=>setGroup('')}>Alle Produkte</button>{config.productGroups.map(g=><button type="button" key={g.id} aria-pressed={group===g.id} onClick={()=>setGroup(g.id)}>{g.name}</button>)}</nav>:null}{products.length?<div className={detail?styles.productDetail:styles.catalog}>{products.map(product=>{
      const remaining=available(product.id,product.stock),soldOut=remaining===0;
      return <article className={styles.product} key={product.id}>
        <EditableImage image={product.image}/>
        <div>{!detail&&<h3><ContentLink href={'/'+productSlug(product)} editable={editable}>{product.title}</ContentLink></h3>}<p className={styles.productKind}>{product.kind==='digital'?'Digitaler Download':product.kind==='service'?'Dienstleistung':'Versandprodukt'}</p><p>{product.description}</p><strong>{creatorMoney(product.priceCents)}</strong>
        {Boolean(product.variants?.length)&&<label>Variante<select value={variants[product.id]||product.variants?.[0]} disabled={busy} onChange={event=>setVariants({...variants,[product.id]:event.target.value})}>{product.variants?.map(variant=><option key={variant}>{variant}</option>)}</select></label>}
        {remaining!==undefined&&remaining>0&&<p className={styles.stock}>Zurzeit verfügbar: {remaining} Stück</p>}
        <button type="button" disabled={editable||!ready||busy||soldOut} onClick={()=>{add({productId:product.id,variant:variants[product.id]||product.variants?.[0],quantity:1});setAdded('Warenkorb für „'+product.title+'“ aktualisiert.');}}>{soldOut?'Zurzeit vergriffen':'In den Warenkorb'}</button></div>
      </article>;
    })}</div>:<p className={styles.notice}>{mode==='product'?(editable?'Wähle im Abschnitt ein aktives Produkt aus deinem Shop.':'Dieses Produkt ist gerade nicht verfügbar.'):search?(c.searchTerm?'Keine passenden Produkte gefunden. Versuchen Sie einen anderen Suchbegriff.':'Geben Sie einen Suchbegriff ein, um Produkte zu finden.'):'Zurzeit sind keine Produkte verfügbar.'}</p>}</>}
    {added&&<p className={styles.notice} role="status">{added}</p>}
    <aside className={styles.cart} aria-label="Warenkorb">
      <h3>Dein Warenkorb</h3>
      {!ready?<p role="status">Warenkorb wird geladen …</p>:!lines.length?<p>Dein Warenkorb ist noch leer. Wähle ein verfügbares Produkt aus.</p>:<>
        <ul>{lines.map((line,index)=><li key={JSON.stringify([line.productId,line.variant])}><div><strong>{line.product!.title}</strong>{line.variant&&<span>{line.variant}</span>}<span>{creatorMoney(line.product!.priceCents)} pro Stück</span></div><label htmlFor={quantityId+'-'+index}>Menge<input id={quantityId+'-'+index} type="number" min="0" max="20" inputMode="numeric" value={line.quantity} disabled={busy||editable} onChange={event=>quantity(line.productId,line.variant,Number(event.target.value))}/></label><strong>{creatorMoney(line.product!.priceCents*line.quantity)}</strong><button className={styles.remove} type="button" disabled={busy||editable} onClick={()=>quantity(line.productId,line.variant,0)} aria-label={line.product!.title+' aus dem Warenkorb entfernen'}>Entfernen</button></li>)}</ul>
        {physical&&countries.length>0&&<label>Lieferland<select value={selectedCountry||''} disabled={busy} onChange={e=>setCountry(e.target.value)}><option value="">Bitte auswählen</option>{countries.map(c=><option key={c} value={c}>{DELIVERY_COUNTRIES[c]||c}</option>)}</select></label>}
        <dl><div><dt>Zwischensumme</dt><dd>{creatorMoney(subtotal)}</dd></div><div><dt>Versand</dt><dd>{shipping===undefined?'Nach Länderauswahl':creatorMoney(shipping)}</dd></div><div><dt>Gesamt</dt><dd>{quote?creatorMoney(quote.totalCents):'Noch offen'}</dd></div>{quote?.taxGroups?.map(t=><div key={t.rate}><dt>Enthaltene USt. {t.rate.toLocaleString('de-DE')} %</dt><dd>{creatorMoney(t.taxCents)}</dd></div>)}</dl>
        {quoteError&&<p role="status" className={styles.notice}>{quoteError}</p>}{state.lines.some(l=>!active.some(p=>p.id===l.productId))&&<p className={styles.notice}>Ein Produkt ist nicht mehr erhältlich. Bitte den Warenkorb leeren und neu zusammenstellen.</p>}
        <p>Endpreise inklusive gegebenenfalls enthaltener Steuer. Bestand und Endsumme werden an der Kasse geprüft. Deine Zahlungsdaten gibst du bei Stripe Checkout ein.</p>
        <div className={styles.actions}><button type="button" disabled={busy||editable||!quote} onClick={()=>void checkout(terminal)}>{busy?'Kasse wird geprüft …':terminal?'Neue Kasse starten':'Zur sicheren Kasse'}</button><button type="button" disabled={busy||editable} onClick={reset}>Warenkorb leeren</button></div>
        <p>Eine angefangene Kasse bleibt bei einer Unterbrechung erhalten. Bei geändertem Warenkorb wird die alte Kasse zuerst beim Zahlungsanbieter beendet.</p>
      </>}
      {attempt?.statusUrl&&<p><a href={attempt.statusUrl}>Angefangene Bestellung prüfen oder fortsetzen</a></p>}
      {error&&<p role="alert" className={styles.error}>{error}</p>}
    </aside>
    {config.consumerSales&&<p><ContentLink href={WITHDRAWAL_PATH} editable={editable} className="ws-withdrawal-link">{WITHDRAWAL_LABEL}</ContentLink></p>}
    {c.secondaryLabel&&<ContentLink href={c.secondaryHref} editField="secondaryHref" editable={editable}>{c.secondaryLabel}</ContentLink>}
    </div>
  </div>;
}
