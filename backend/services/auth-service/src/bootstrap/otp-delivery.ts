import { getEnv, type EnvType } from "./config.js";
import { renderOtpEmail, type OtpType } from "./otp-email.js";

export class OtpDeliveryError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "OtpDeliveryError";
  }
}

export interface SendOtpInput {
  email: string;
  otp: string;
  type: OtpType;
  env?: EnvType;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function sendOtpEmail({
  email,
  otp,
  type,
  env = getEnv(),
  fetchImpl = fetch,
  timeoutMs = 5_000,
}: SendOtpInput): Promise<void> {
  const message = renderOtpEmail({ otp, type, expiresInSeconds: 300 });

  let response: Response;
  try {
    response = await fetchImpl(`${env.NOTIFICATION_SERVICE_URL}/internal/emails`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-token": env.INTERNAL_SERVICE_TOKEN,
      },
      body: JSON.stringify({ to: email, ...message }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new OtpDeliveryError("OTP delivery request failed", error);
  }

  if (!response.ok) {
    throw new OtpDeliveryError(`OTP delivery failed with status ${response.status}`);
  }
}
