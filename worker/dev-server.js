/**
 * Local Node.js adapter for running the Hono Cloudflare Worker (worker/index.js)
 * on http://127.0.0.1:8787 during local development or when Wrangler is not used.
 */

import http from 'node:http';
import app from './index.js';

const PORT = Number(process.env.PORT || 8787);

export const nodeWorkerServer = http.createServer(async (req, res) => {
  try {
    const url = `http://127.0.0.1:${PORT}${req.url || '/'}`;
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    const requestInit = {
      method: req.method,
      headers: req.headers,
      ...(req.method !== 'GET' && req.method !== 'HEAD' && bodyBuffer.length > 0
        ? { body: bodyBuffer }
        : {}),
    };

    const webRes = await app.fetch(new Request(url, requestInit), process.env);

    const responseHeaders = {};
    webRes.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    res.writeHead(webRes.status, responseHeaders);
    const arrayBuffer = await webRes.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  nodeWorkerServer.listen(PORT, () => {
    console.log(`⛅ MIRAS Hono Worker running at http://127.0.0.1:${PORT}`);
  });
}
