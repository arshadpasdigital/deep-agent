import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import type { AuthFlow } from "../hooks/use-auth-flow"

export function OtpForm({ flow }: { flow: AuthFlow }) {
  const {
    otp,
    fieldErrors,
    pending,
    cooldown,
    attemptsExhausted,
    setOtp,
    clearFieldError,
    verifyCode,
    resendCode,
    usePasswordInstead,
  } = flow

  const verifying = pending === "verify"
  const resending = pending === "resend"
  const inputsDisabled = attemptsExhausted || verifying

  return (
    <form className="space-y-5" onSubmit={verifyCode} noValidate aria-busy={pending !== null}>
      <div className="space-y-2">
        <label
          htmlFor="otp"
          className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[var(--auth-muted)]"
        >
          Verification code
        </label>
        <InputOTP
          id="otp"
          value={otp}
          onChange={(value) => {
            setOtp(value)
            if (value.length === 6) clearFieldError("otp")
          }}
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          disabled={inputsDisabled}
          containerClassName="justify-center"
          aria-invalid={fieldErrors.otp ? true : undefined}
          aria-describedby={fieldErrors.otp ? "otp-error" : undefined}
        >
          <InputOTPGroup className="gap-1.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="size-10 rounded-md border border-[var(--auth-line-strong)] bg-[var(--auth-surface-raised)] font-mono text-base text-[var(--auth-ink)]"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {fieldErrors.otp ? (
          <p id="otp-error" className="text-center text-xs text-destructive">
            {fieldErrors.otp}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={otp.length !== 6 || pending !== null || attemptsExhausted}
        className="w-full bg-[var(--auth-accent)] text-[var(--auth-accent-ink)] hover:bg-[var(--auth-accent)]/90"
      >
        {verifying ? "Verifying..." : "Verify code"}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={resendCode}
          disabled={cooldown > 0 || pending !== null}
          className="font-mono uppercase tracking-[0.12em] text-[var(--auth-muted)] underline-offset-4 hover:text-[var(--auth-ink)] hover:underline disabled:opacity-60"
        >
          {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
        <button
          type="button"
          onClick={usePasswordInstead}
          className="text-[var(--auth-ink)] underline-offset-4 hover:underline"
        >
          Use a password instead
        </button>
      </div>
    </form>
  )
}
