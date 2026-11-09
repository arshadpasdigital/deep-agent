import { getEnv, type EnvType } from "@/bootstrap/config.js";
import { sendMail } from "@/infrastructure/sendMail.js";
import type { MailLogger, MailTransport, SendEmailRequest } from "./email.types.js";

export class EmailDeliveryError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "EmailDeliveryError";
  }
}

type MailEnvironment = Pick<EnvType, "NODE_ENV" | "EMAIL_HOST" | "EMAIL_FROM">;

export interface EmailServiceOptions {
  env?: MailEnvironment;
  mailer?: MailTransport;
  logger?: MailLogger;
}

export class EmailService {
  private readonly env: MailEnvironment | undefined;
  private readonly mailer: MailTransport;
  private readonly logger: MailLogger;

  constructor({ env, mailer = sendMail, logger = console }: EmailServiceOptions = {}) {
    this.env = env;
    this.mailer = mailer;
    this.logger = logger;
  }

  async send(message: SendEmailRequest): Promise<void> {
    const env = this.env ?? getEnv();

    if (!env.EMAIL_HOST || !env.EMAIL_FROM) {
      if (env.NODE_ENV === "production") {
        throw new EmailDeliveryError("Email transport is not configured");
      }
      this.logger.info(
        `[development] email to ${message.to}: ${message.subject}\n${message.text}`,
      );
      return;
    }

    try {
      await this.mailer({
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (error) {
      throw new EmailDeliveryError("Email delivery failed", error);
    }
  }
}
