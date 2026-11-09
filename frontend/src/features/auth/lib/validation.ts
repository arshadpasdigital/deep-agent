export type AuthField = "name" | "email" | "password" | "otp"
export type FieldErrors = Partial<Record<AuthField, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): FieldErrors {
  if (!EMAIL_PATTERN.test(email.trim())) {
    return { email: "Enter a valid email address." }
  }
  return {}
}

export function validateSignIn(values: { email: string; password: string }): FieldErrors {
  const errors = validateEmail(values.email)
  if (!values.password) {
    errors.password = "Enter your password."
  }
  return errors
}

export function validateSignUp(values: {
  name: string
  email: string
  password: string
}): FieldErrors {
  const errors = validateEmail(values.email)
  if (!values.name.trim()) {
    errors.name = "Enter your name."
  }
  if (values.password.length < 8) {
    errors.password = "Use at least 8 characters."
  }
  return errors
}

export function validateOtp(otp: string): FieldErrors {
  if (!/^\d{6}$/.test(otp)) {
    return { otp: "Enter the six-digit code." }
  }
  return {}
}
