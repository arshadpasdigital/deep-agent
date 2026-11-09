import { describe, expect, test } from "bun:test";
import { EmailDeliveryError, EmailService } from "./email.service.ts";

const silentLogger = { info() {} };

describe("EmailService", () => {
  test("sends through the configured transport", async () => {
    const sent: unknown[] = [];
    const service = new EmailService({
      env: { NODE_ENV: "development", EMAIL_HOST: "smtp.example.test", EMAIL_FROM: "from@example.test" },
      mailer: async (message) => {
        sent.push(message);
      },
      logger: silentLogger,
    });

    await service.send({ to: "user@example.test", subject: "Hello", text: "Body" });

    expect(sent).toEqual([
      { to: "user@example.test", subject: "Hello", text: "Body", html: undefined },
    ]);
  });

  test("logs the message in development when mail is unconfigured", async () => {
    const logs: string[] = [];
    let called = false;
    const service = new EmailService({
      env: { NODE_ENV: "development" },
      mailer: async () => {
        called = true;
      },
      logger: { info: (message) => logs.push(message) },
    });

    await service.send({ to: "user@example.test", subject: "OTP", text: "Code 123456" });

    expect(called).toBe(false);
    expect(logs.join("\n")).toContain("Code 123456");
  });

  test("fails in production when mail is unconfigured", async () => {
    const service = new EmailService({
      env: { NODE_ENV: "production" },
      mailer: async () => {},
      logger: silentLogger,
    });

    await expect(
      service.send({ to: "user@example.test", subject: "OTP", text: "Code 123456" }),
    ).rejects.toBeInstanceOf(EmailDeliveryError);
  });

  test("wraps transport failures", async () => {
    const service = new EmailService({
      env: { NODE_ENV: "development", EMAIL_HOST: "smtp.example.test", EMAIL_FROM: "from@example.test" },
      mailer: async () => {
        throw new Error("smtp down");
      },
      logger: silentLogger,
    });

    await expect(
      service.send({ to: "user@example.test", subject: "OTP", text: "Code 123456" }),
    ).rejects.toBeInstanceOf(EmailDeliveryError);
  });
});
