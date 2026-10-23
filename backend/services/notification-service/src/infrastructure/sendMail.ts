import nodemailer from "nodemailer";
import type { SendMailOptions, SentMessageInfo, Transporter } from "nodemailer";
import { env } from "../bootstrap/config.js";

export type MailMessage = Pick<SendMailOptions, "to" | "subject" | "text" | "html" | "cc" | "bcc" | "replyTo" | "attachments">;

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  if (!env.EMAIL_HOST || !env.EMAIL_FROM) {
    throw new Error("Email is not configured. Set EMAIL_HOST and EMAIL_FROM before sending mail.");
  }

  if (Boolean(env.EMAIL_USER) !== Boolean(env.EMAIL_PASSWORD)) {
    throw new Error("Set both EMAIL_USER and EMAIL_PASSWORD to enable SMTP authentication.");
  }

  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE,
    ...(env.EMAIL_USER && env.EMAIL_PASSWORD
      ? { auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD } }
      : {}),
  });

  return transporter;
}

export async function sendMail(message: MailMessage): Promise<SentMessageInfo> {
  return getTransporter().sendMail({
    ...message,
    from: env.EMAIL_FROM,
  });
}

