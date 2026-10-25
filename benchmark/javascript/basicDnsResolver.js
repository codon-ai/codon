import dns from "node:dns/promises";

export async function resolveDomainRecords(domain) {
  const [aResult, mxResult] = await Promise.allSettled([
    dns.resolve4(domain),
    dns.resolveMx(domain),
  ]);

  const ipv4 = aResult.status === "fulfilled" ? aResult.value : [];
  const mxRecords =
    mxResult.status === "fulfilled"
      ? Array.from(mxResult.value).sort((a, b) => a.priority - b.priority)
      : [];

  return { ipv4, mxRecords };
}