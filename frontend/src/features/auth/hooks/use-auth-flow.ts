import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "@tanstack/react-router"

import { authClient } from "../api/client"
import {
  friendlyAuthError,
  isEmailUnverified,
  isTooManyAttempts,
  NETWORK_MESSAGE,
} from "../lib/errors"
import {
  validateEmail,
  validateOtp,
  validateSignIn,
  validateSignUp,
  type AuthField,
  type FieldErrors,
} from "../lib/validation"

export type AuthMode = "signin" | "signup"
export type AuthStep = "form" | "otp"
export type OtpPurpose = "signup" | "signin"
export type PendingAction = "password" | "code" | "google" | "verify" | "resend" | null

const RESEND_COOLDOWN_SECONDS = 60

function focusFirstField(errors: FieldErrors, order: AuthField[]) {
  const first = order.find((field) => errors[field])
  if (!first) return
  requestAnimationFrame(() => document.getElementById(first)?.focus())
}

export function useAuthFlow() {
  const session = authClient.useSession()
  const navigate = useNavigate()

  const [mode, setMode] = useState<AuthMode>("signin")
  const [step, setStep] = useState<AuthStep>("form")
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>("signup")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)
  const [cooldown, setCooldown] = useState(0)
  const [attemptsExhausted, setAttemptsExhausted] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => {
      setCooldown((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  function clearFieldError(field: AuthField) {
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function resetTransientState() {
    setFieldErrors({})
    setFormError(null)
    setNotice(null)
  }

  function switchMode(next: AuthMode) {
    setMode(next)
    setStep("form")
    setPassword("")
    setOtp("")
    setAttemptsExhausted(false)
    resetTransientState()
  }

  async function complete() {
    await session.refetch()
    await navigate({ to: "/" })
  }

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetTransientState()

    const errors =
      mode === "signin"
        ? validateSignIn({ email, password })
        : validateSignUp({ name, email, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstField(errors, mode === "signin" ? ["email", "password"] : ["name", "email", "password"])
      return
    }

    setPending("password")
    try {
      if (mode === "signin") {
        const { error } = await authClient.signIn.email({ email: email.trim(), password })
        if (error) {
          if (isEmailUnverified(error)) {
            setOtpPurpose("signup")
            const sent = await authClient.emailOtp.sendVerificationOtp({
              email: email.trim(),
              type: "email-verification",
            })
            if (sent.error) {
              setFormError(friendlyAuthError(sent.error))
              return
            }
            setOtp("")
            setStep("otp")
            setCooldown(RESEND_COOLDOWN_SECONDS)
            setNotice("Verify your email to continue. We sent a new code.")
            return
          }
          setPassword("")
          setFormError(friendlyAuthError(error))
          return
        }
        await complete()
        return
      }

      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      if (error && !isEmailUnverified(error)) {
        setFormError(friendlyAuthError(error))
        return
      }
      setOtpPurpose("signup")
      setOtp("")
      setStep("otp")
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setNotice("We sent a six-digit verification code to your email.")
    } catch {
      setFormError(NETWORK_MESSAGE)
    } finally {
      setPending(null)
    }
  }

  async function requestCode() {
    resetTransientState()
    const errors = validateEmail(email)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstField(errors, ["email"])
      return
    }

    setPending("code")
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "sign-in",
      })
      if (error) {
        setFormError(friendlyAuthError(error))
        return
      }
      setOtpPurpose("signin")
      setOtp("")
      setStep("otp")
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setNotice("We sent a sign-in code to your email.")
    } catch {
      setFormError(NETWORK_MESSAGE)
    } finally {
      setPending(null)
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetTransientState()

    const errors = validateOtp(otp)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstField(errors, ["otp"])
      return
    }

    setPending("verify")
    try {
      if (otpPurpose === "signup") {
        const verified = await authClient.emailOtp.verifyEmail({
          email: email.trim(),
          otp,
        })
        if (verified.error) {
          if (isTooManyAttempts(verified.error)) setAttemptsExhausted(true)
          setFormError(friendlyAuthError(verified.error))
          return
        }

        if (password) {
          const signedIn = await authClient.signIn.email({ email: email.trim(), password })
          if (signedIn.error) {
            setMode("signin")
            setStep("form")
            setPassword("")
            setFormError("Your email is verified. Sign in to continue.")
            return
          }
        }

        await complete()
        return
      }

      const signedIn = await authClient.signIn.emailOtp({ email: email.trim(), otp })
      if (signedIn.error) {
        if (isTooManyAttempts(signedIn.error)) setAttemptsExhausted(true)
        setFormError(friendlyAuthError(signedIn.error))
        return
      }
      await complete()
    } catch {
      setFormError(NETWORK_MESSAGE)
    } finally {
      setPending(null)
    }
  }

  async function resendCode() {
    if (cooldown > 0 || pending !== null) return
    resetTransientState()
    setPending("resend")
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: otpPurpose === "signup" ? "email-verification" : "sign-in",
      })
      if (error) {
        setFormError(friendlyAuthError(error))
        return
      }
      setOtp("")
      setAttemptsExhausted(false)
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setNotice("A new code is on its way.")
    } catch {
      setFormError(NETWORK_MESSAGE)
    } finally {
      setPending(null)
    }
  }

  async function continueWithGoogle() {
    resetTransientState()
    setPending("google")
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      })
      if (error) {
        setFormError(friendlyAuthError(error))
        setPending(null)
      }
    } catch {
      setFormError(NETWORK_MESSAGE)
      setPending(null)
    }
  }

  function usePasswordInstead() {
    setMode("signin")
    setStep("form")
    setPassword("")
    setOtp("")
    setAttemptsExhausted(false)
    resetTransientState()
  }

  return {
    session,
    mode,
    step,
    otpPurpose,
    name,
    email,
    password,
    otp,
    fieldErrors,
    formError,
    notice,
    pending,
    cooldown,
    attemptsExhausted,
    setName,
    setEmail,
    setPassword,
    setOtp,
    clearFieldError,
    switchMode,
    submitCredentials,
    requestCode,
    verifyCode,
    resendCode,
    continueWithGoogle,
    usePasswordInstead,
  }
}

export type AuthFlow = ReturnType<typeof useAuthFlow>
