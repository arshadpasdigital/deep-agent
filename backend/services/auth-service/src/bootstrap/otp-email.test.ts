import { describe, expect, test } from "bun:test";
import { renderOtpEmail } from "./otp-email.ts";

describe("renderOtpEmail", () => {
  test("includes the code, the action, and the expiry", () => {
    const message = renderOtpEmail({ otp: "123456", type: "email-verification", expiresInSeconds: 300 });

    expect(message.text).toContain("123456");
    expect(message.text).toContain("verify your email");
    expect(message.text).toContain("5 minutes");
    expect(message.subject).toContain("verify your email");
    expect(message.html).toContain("123456");
  });

  test("labels sign-in codes distinctly", () => {
    const message = renderOtpEmail({ otp: "654321", type: "sign-in", expiresInSeconds: 60 });

    expect(message.text).toContain("sign in");
    expect(message.text).toContain("1 minute");
  });
});
