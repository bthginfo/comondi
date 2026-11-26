const normalize=(value:string)=>value.toLocaleLowerCase('de').replaceAll('ß','ss').normalize('NFKD').replace(/\p{Mark}/gu,'').replace(/[^\p{Letter}\p{Number}]+/gu,' ').trim();

export function findWorkspaceAreas<T extends {label:string}>(items:readonly T[],query:string):T[]{
 const terms=normalize(query).split(' ').filter(Boolean);
 if(!terms.length)return [...items];
 return items.filter(item=>{
  const label=normalize(item.label);
  return terms.every(term=>label.includes(term));
 });
}

export type WorkspaceResult = { id: string; label: string; group: string; terms?: string };
/** Areas, pages and settings in one list: label matches first, then matches on additional terms. */
export function findWorkspaceResults<T extends WorkspaceResult>(items: readonly T[], query: string, limit = 12): T[] {
 const terms = normalize(query).split(' ').filter(Boolean);
 if (!terms.length) return items.filter(item => item.group === 'area').slice(0, limit);
 const scored: { item: T; score: number }[] = [];
 for (const item of items) {
  const label = normalize(item.label), extra = normalize(item.terms ?? '');
  if (!terms.every(term => label.includes(term) || extra.includes(term))) continue;
  const score = terms.every(term => label.includes(term)) ? (label.startsWith(terms[0]) ? 0 : 1) : 2;
  scored.push({ item, score });
 }
 return scored.sort((a, b) => a.score - b.score).slice(0, limit).map(entry => entry.item);
}
