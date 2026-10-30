import dns from "node:dns/promises";
export async function resolveDomainRecords(domain) {
  const [a, mx] = await Promise.allSettled([dns.resolve4(domain), dns.resolveMx(domain)]);
  const ipv4 = a.status === "fulfilled" ? a.value : [];
  const mxRecords = mx.status === "fulfilled" ? [...mx.value].sort((x, y) => x.priority - y.priority) : [];
  return { ipv4, mxRecords };
}
