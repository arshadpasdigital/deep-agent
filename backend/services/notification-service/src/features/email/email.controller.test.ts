import { once } from "node:events";
import { describe, expect, test } from "bun:test";
import express from "express";
import { EmailController } from "./email.controller.ts";
import { EmailService } from "./email.service.ts";
import { createEmailRouter } from "./email.router.ts";

async function startServer(options: { token?: string; fail?: boolean } = {}) {
  const sent: unknown[] = [];
  const service = new EmailService({
    env: { NODE_ENV: "development", EMAIL_HOST: "smtp.example.test", EMAIL_FROM: "from@example.test" },
    mailer: async (message) => {
      if (options.fail) throw new Error("smtp down");
      sent.push(message);
    },
    logger: { info() {} },
  });
  const app = express();
  app.use(express.json());
  app.use("/internal", createEmailRouter(new EmailController(service, options.token ?? "secret")));
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind");
  return { server, sent, baseUrl: `http://127.0.0.1:${address.port}` };
}

describe("internal email endpoint", () => {
  test("requires the internal token", async () => {
    const { server, baseUrl } = await startServer();
    try {
      const response = await fetch(`${baseUrl}/internal/emails`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: "user@example.test", subject: "Hi", text: "Body" }),
      });
      expect(response.status).toBe(401);
    } finally {
      server.close();
      await once(server, "close");
    }
  });

  test("rejects an invalid payload", async () => {
    const { server, baseUrl } = await startServer();
    try {
      const response = await fetch(`${baseUrl}/internal/emails`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-internal-token": "secret" },
        body: JSON.stringify({ to: "not-an-email" }),
      });
      expect(response.status).toBe(400);
    } finally {
      server.close();
      await once(server, "close");
    }
  });

  test("sends a valid email", async () => {
    const { server, sent, baseUrl } = await startServer();
    try {
      const response = await fetch(`${baseUrl}/internal/emails`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-internal-token": "secret" },
        body: JSON.stringify({ to: "user@example.test", subject: "OTP", text: "Code 123456" }),
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(sent).toHaveLength(1);
    } finally {
      server.close();
      await once(server, "close");
    }
  });

  test("returns a delivery error when the transport fails", async () => {
    const { server, baseUrl } = await startServer({ fail: true });
    try {
      const response = await fetch(`${baseUrl}/internal/emails`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-internal-token": "secret" },
        body: JSON.stringify({ to: "user@example.test", subject: "OTP", text: "Code 123456" }),
      });
      expect(response.status).toBe(502);
      expect(await response.json()).toMatchObject({ success: false });
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
