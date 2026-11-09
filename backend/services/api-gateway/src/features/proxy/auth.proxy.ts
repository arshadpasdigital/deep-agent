import express, { type Request, type Response } from "express";

export interface AuthProxyOptions {
  authServiceUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const HOP_BY_HOP_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
]);

export function createAuthProxyRouter({
  authServiceUrl,
  fetchImpl = fetch,
  timeoutMs = 10_000,
}: AuthProxyOptions) {
  const router = express.Router();

  router.use(async (request: Request, response: Response) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of request) {
        chunks.push(Buffer.from(chunk));
      }
      const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (!value || HOP_BY_HOP_HEADERS.has(key)) continue;
        if (Array.isArray(value)) {
          for (const item of value) headers.append(key, item);
        } else {
          headers.set(key, value);
        }
      }

      const upstream = await fetchImpl(new URL(request.originalUrl, authServiceUrl), {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : body,
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
      });

      response.status(upstream.status);
      upstream.headers.forEach((value, key) => {
        if (["content-encoding", "content-length", "transfer-encoding", "set-cookie"].includes(key)) {
          return;
        }
        response.append(key, value);
      });

      const cookies = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.();
      if (cookies && cookies.length > 0) {
        for (const cookie of cookies) response.append("set-cookie", cookie);
      } else {
        const cookie = upstream.headers.get("set-cookie");
        if (cookie) response.append("set-cookie", cookie);
      }

      response.send(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      response.status(502).json({ error: "upstream_unavailable" });
    }
  });

  return router;
}
