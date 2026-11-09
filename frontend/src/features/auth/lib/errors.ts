export interface AuthErrorLike {
  code?: string
  message?: string
  status?: number
}

export const NETWORK_MESSAGE = "Can't reach the server. Check your connection and retry."

export function friendlyAuthError(error: AuthErrorLike | null | undefined): string {
  if (!error) {
    return "Something went wrong. Try again."
  }

  const code = (error.code ?? "").toUpperCase()

  if (code === "EMAIL_NOT_VERIFIED") {
    return "Verify your email to continue."
  }
  if (
    code.includes("INVALID_EMAIL_OR_PASSWORD") ||
    code.includes("INVALID_PASSWORD") ||
    code.includes("INVALID_EMAIL")
  ) {
    return "Email or password is incorrect."
  }
  if (code === "OTP_EXPIRED") {
    return "That code expired. Send a new one."
  }
  if (code === "INVALID_OTP") {
    return "That code doesn't match. Try again."
  }
  if (code === "TOO_MANY_ATTEMPTS") {
    return "Too many attempts. Request a new code."
  }
  if (
    error.status === 429 ||
    code.includes("RATE_LIMIT") ||
    code.includes("TOO_MANY_REQUESTS")
  ) {
    return "Too many requests. Try again in a minute."
  }
  if (error.status === 502 || error.status === 503 || code.includes("NETWORK")) {
    return NETWORK_MESSAGE
  }

  return error.message?.trim() || "Something went wrong. Try again."
}

export function isEmailUnverified(error: AuthErrorLike | null | undefined): boolean {
  return (error?.code ?? "").toUpperCase() === "EMAIL_NOT_VERIFIED"
}

export function isTooManyAttempts(error: AuthErrorLike | null | undefined): boolean {
  return (error?.code ?? "").toUpperCase() === "TOO_MANY_ATTEMPTS"
}
