import { once } from "node:events";
import { describe, expect, test } from "bun:test";
import express from "express";
import { createApp } from "../../bootstrap/app.ts";

async function startUpstream() {
  const app = express();
  app.use(express.raw({ type: "*/*" }));
  app.use("/api/auth", (request, response) => {
    response.status(202);
    response.setHeader("x-upstream", "auth");
    response.setHeader("set-cookie", ["session=abc; Path=/; HttpOnly", "other=def; Path=/"]);
    response.send(
      JSON.stringify({
        method: request.method,
        url: request.originalUrl,
        body: request.body?.toString() ?? "",
      }),
    );
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Upstream did not bind");
  return { server, url: `http://127.0.0.1:${address.port}` };
}

async function startGateway(authServiceUrl: string) {
  const server = createApp({
    apiRouter: express.Router(),
    config: { ORIGIN: "http://localhost:5173", AUTH_SERVICE_URL: authServiceUrl },
  }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Gateway did not bind");
  return { server, url: `http://127.0.0.1:${address.port}` };
}

describe("gateway auth proxy", () => {
  test("forwards method, path, body, headers, and set-cookie", async () => {
    const upstream = await startUpstream();
    const gateway = await startGateway(upstream.url);
    try {
      const response = await fetch(`${gateway.url}/api/auth/sign-in/email?x=1`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-request-id": "req-1" },
        body: JSON.stringify({ email: "user@example.test" }),
      });

      expect(response.status).toBe(202);
      expect(response.headers.get("x-upstream")).toBe("auth");
      expect(await response.json()).toEqual({
        method: "POST",
        url: "/api/auth/sign-in/email?x=1",
        body: JSON.stringify({ email: "user@example.test" }),
      });
      expect(response.headers.getSetCookie()).toEqual([
        "session=abc; Path=/; HttpOnly",
        "other=def; Path=/",
      ]);
    } finally {
      gateway.server.close();
      upstream.server.close();
      await Promise.all([once(gateway.server, "close"), once(upstream.server, "close")]);
    }
  });

  test("allows the configured origin with credentials", async () => {
    const upstream = await startUpstream();
    const gateway = await startGateway(upstream.url);
    try {
      const preflight = await fetch(`${gateway.url}/api/auth/get-session`, {
        method: "OPTIONS",
        headers: {
          origin: "http://localhost:5173",
          "access-control-request-method": "GET",
          "access-control-request-headers": "content-type",
        },
      });
      expect(preflight.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
      expect(preflight.headers.get("access-control-allow-credentials")).toBe("true");

      const response = await fetch(`${gateway.url}/api/auth/get-session`, {
        headers: { origin: "http://localhost:5173", cookie: "session=abc" },
      });
      expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
      expect(response.headers.get("access-control-allow-credentials")).toBe("true");
    } finally {
      gateway.server.close();
      upstream.server.close();
      await Promise.all([once(gateway.server, "close"), once(upstream.server, "close")]);
    }
  });

  test("returns a 502 when the auth service is unavailable", async () => {
    const gateway = await startGateway("http://127.0.0.1:1");
    try {
      const response = await fetch(`${gateway.url}/api/auth/get-session`);
      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({ error: "upstream_unavailable" });
    } finally {
      gateway.server.close();
      await once(gateway.server, "close");
    }
  });
});
