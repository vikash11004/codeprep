import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

export function publicAddress(address) {
  try { const ip = ipaddr.process(address.replace(/^\[|\]$/g, '')); return ip.range() === 'unicast'; } catch { return false; }
}
export async function validateUrl(value, resolve = lookup) {
  let url; try { url = new URL(value); } catch { throw new Error('Enter a valid public HTTP or HTTPS link.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port))) throw new Error('Only public HTTP(S) links on standard ports are supported.');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) throw new Error('Private network links are not allowed.');
  const addresses = ipaddr.isValid(host) ? [{ address: host, family: ipaddr.parse(host).kind() === 'ipv6' ? 6 : 4 }] : await resolve(host, { all: true });
  if (!addresses.length || addresses.some(x => !publicAddress(x.address))) throw new Error('Private or reserved network addresses are not allowed.');
  return { url, addresses };
}
