import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {decrypt,encrypt,hashPassword,safeLink,verifyPassword} from '../src/lib/security';

test('password hashes are salted and verify only the matching password',async()=>{
  const password=randomBytes(24).toString('base64url');
  const [first,second]=await Promise.all([hashPassword(password),hashPassword(password)]);
  assert.notEqual(first,second);assert(!first.includes(password));
  assert.equal(await verifyPassword(password,first),true);
  assert.equal(await verifyPassword(password+'x',first),false);
  assert.equal(await verifyPassword(password,'invalid'),false);
});
test('SMTP secrets use authenticated encryption and reject tampering',()=>{
  process.env.AUTH_SECRET=randomBytes(48).toString('base64url');
  const value='test credential '+randomBytes(12).toString('hex');
  const encoded=encrypt(value);assert(!encoded.includes(value));assert.equal(decrypt(encoded),value);assert.notEqual(encrypt(value),encoded);
  const pieces=encoded.split('.');const bytes=Buffer.from(pieces[3],'base64url');bytes[0]^=1;pieces[3]=bytes.toString('base64url');
  assert.throws(()=>decrypt(pieces.join('.')));
});
test('links cannot inject executable protocols or protocol-relative redirects',()=>{
  for(const link of ['/kontakt','#team','https://example.org/','tel:+490000000000','mailto:info@example.org'])assert.equal(safeLink(link),true,link);
  for(const link of ['javascript:alert(1)','data:text/html,test','//example.org','/\\example.org','vbscript:test'])assert.equal(safeLink(link),false,link);
});
test('rate limits group IPv6 clients by their /64 network and keep IPv4 addresses',async()=>{
  const {clientNetwork}=await import('../src/lib/client-network');
  assert.equal(clientNetwork('203.0.113.9'),'203.0.113.9');
  assert.equal(clientNetwork('::ffff:203.0.113.9'),'203.0.113.9');
  assert.equal(clientNetwork('2001:db8:0:12:aaaa:bbbb:cccc:dddd'),'2001:db8:0:12::/64');
  assert.equal(clientNetwork('2001:DB8:0:12::1'),clientNetwork('[2001:db8:0:12:ffff::2]:443'));
  assert.notEqual(clientNetwork('2001:db8:0:12::1'),clientNetwork('2001:db8:0:13::1'));
  assert.equal(clientNetwork('::1'),'0:0:0:0::/64');
});
test('a stored SMTP password is only reused for the same server and account',async()=>{
  const {sameSmtpAccount}=await import('../src/lib/client-network');
  const saved={host:'smtp.example.org',port:465,user:'info@example.org'};
  assert.equal(sameSmtpAccount({...saved,host:' SMTP.example.org '},saved),true);
  assert.equal(sameSmtpAccount({...saved,host:'mail.example.net'},saved),false);
  assert.equal(sameSmtpAccount({...saved,port:587},saved),false);
  assert.equal(sameSmtpAccount({...saved,user:'other@example.org'},saved),false);
});
