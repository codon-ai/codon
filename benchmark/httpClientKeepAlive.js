import http from "node:http";
export function createKeepAliveAgent(maxSockets = 10, keepAliveMsecs = 30000) {
  return new http.Agent({ keepAlive: true, maxSockets, keepAliveMsecs });
}
export function getWithAgent(urlStr, agent) {
  return new Promise((resolve, reject) => {
    http.get(urlStr, { agent }, res => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve({ statusCode: res.statusCode || 200, body }));
    }).on("error", reject);
  });
}
