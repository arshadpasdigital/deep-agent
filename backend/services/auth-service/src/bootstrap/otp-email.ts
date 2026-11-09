export type OtpType = "sign-in" | "email-verification" | "forget-password" | "change-email";

export interface OtpEmailInput {
  otp: string;
  type: OtpType;
  expiresInSeconds: number;
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

const ACTION_LABELS: Record<OtpType, string> = {
  "sign-in": "sign in",
  "email-verification": "verify your email",
  "forget-password": "reset your password",
  "change-email": "confirm your new email",
};

export function renderOtpEmail({ otp, type, expiresInSeconds }: OtpEmailInput): RenderedEmail {
  const action = ACTION_LABELS[type];
  const minutes = Math.max(1, Math.round(expiresInSeconds / 60));
  const expiry = `${minutes} minute${minutes === 1 ? "" : "s"}`;

  return {
    subject: `Your Deep Agent code to ${action}`,
    text: `Your Deep Agent code to ${action} is ${otp}. It expires in ${expiry}. If you did not request this code, you can ignore this email.`,
    html: [
      `<p>Your Deep Agent code to ${action} is <strong>${otp}</strong>.</p>`,
      `<p>It expires in ${expiry}.</p>`,
      `<p>If you did not request this code, you can ignore this email.</p>`,
    ].join(""),
  };
}
