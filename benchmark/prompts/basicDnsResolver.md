# DNS A and MX Record Resolver
Create a DNS record resolver utility using node:dns/promises in a single file.

Requirements:
- Import `dns` from `"node:dns/promises"`.
- Export interface `DnsLookupResult { ipv4: string[]; mxRecords: Array<{ exchange: string; priority: number }>; }`.
- Export async function `resolveDomainRecords(domain: string): Promise<DnsLookupResult>`.
- Execute `dns.resolve4(domain)` and `dns.resolveMx(domain)` concurrently with `Promise.allSettled`.
- Extract resolved IPv4 addresses from fulfilled A record promise (or empty array if rejected).
- Extract resolved MX records sorted by priority ascending from fulfilled MX promise (or empty array if rejected).
- Return `{ ipv4, mxRecords }`.
