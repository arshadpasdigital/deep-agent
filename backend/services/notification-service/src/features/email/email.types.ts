export interface SendEmailRequest {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export type MailTransport = (message: SendEmailRequest) => Promise<unknown>;

export interface MailLogger {
  info(message: string): void;
}
