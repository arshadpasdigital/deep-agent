import type { NextFunction, Request, Response } from "express";
import { getEnv } from "@/bootstrap/config.js";
import { sendEmailSchema } from "./email.schema.js";
import type { EmailService } from "./email.service.js";

export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly internalToken?: string,
  ) {}

  send = async (request: Request, response: Response, _next: NextFunction): Promise<void> => {
    const expected = this.internalToken ?? getEnv().INTERNAL_SERVICE_TOKEN;
    const provided = request.header("x-internal-token");

    if (!provided || provided !== expected) {
      response.status(401).json({ success: false, error: { code: "unauthorized", message: "Invalid internal token" } });
      return;
    }

    const parsed = sendEmailSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ success: false, error: { code: "invalid_email", message: "Invalid email payload" } });
      return;
    }

    try {
      await this.emailService.send(parsed.data);
      response.json({ success: true });
    } catch (error) {
      console.error("notification-service failed to deliver email", error);
      response.status(502).json({ success: false, error: { code: "delivery_failed", message: "Email delivery failed" } });
    }
  };
}
