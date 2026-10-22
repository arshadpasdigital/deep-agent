import { once } from "node:events";
import { describe, expect, test } from "bun:test";
import express from "express";
import { createApp } from "./app.ts";

describe("Auth Service Express app", () => {
  test("serves health and applies security, parsing, version mounting, and request logging", async () => {
    const logs: string[] = [];
    const logStream = { write: (line: string) => logs.push(line) };
    const featureRouter = express.Router();
    featureRouter.post("/__test", (request, response) => response.json({ body: request.body }));
    const server = createApp({ featureRouter, logStream }).listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind a TCP port");
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const health = await fetch(`${baseUrl}/health`);
      expect(health.status).toBe(200);
      expect(health.headers.get("x-content-type-options")).toBe("nosniff");
      expect(await health.json()).toMatchObject({ service: "auth-service", status: "ok" });

      const response = await fetch(`${baseUrl}/api/v1/auth/__test`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ping: "pong" }),
      });
      expect(await response.json()).toEqual({ body: { ping: "pong" } });
      expect(logs.join("\n")).toContain("/api/v1/auth/__test");
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
