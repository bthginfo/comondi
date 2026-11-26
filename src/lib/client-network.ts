// IPv6 clients usually control a whole /64 network, so rate limits count that network as one client.
export function clientNetwork(ip:string):string{
  const address=ip.trim().replace(/^\[|\](:\d+)?$/g,'').split('%')[0].toLowerCase();
  if(!address.includes(':'))return address;
  if(/^::ffff:\d+\.\d+\.\d+\.\d+$/.test(address))return address.slice(7);
  const [head,tail='']=address.split('::');
  const left=head?head.split(':'):[];const right=tail?tail.split(':'):[];
  const groups=address.includes('::')?[...left,...Array(Math.max(0,8-left.length-right.length)).fill('0'),...right]:left;
  return groups.slice(0,4).map(group=>group.replace(/^0+(?=.)/,'')).join(':')+'::/64';
}

// A stored SMTP password is only reused for the same server and account, so it is never sent to a newly entered host.
export function sameSmtpAccount(next:{host:string;port:number;user:string},previous:{host:string;port:number;user:string}):boolean{
  return next.host.trim().toLowerCase()===previous.host.trim().toLowerCase()&&next.port===previous.port&&next.user.trim()===previous.user.trim();
}
