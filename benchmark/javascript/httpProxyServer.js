import http from "node:http";

export function createProxyServer(targetHost, targetPort) {
  return http.createServer((req, res) => {
    const options = {
      hostname: targetHost,
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${targetHost}:${targetPort}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", () => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Bad Gateway" }));
    });

    req.pipe(proxyReq);
  });
}
