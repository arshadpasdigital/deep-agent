import { Navigate } from "@tanstack/react-router"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuthFlow, type AuthFlow } from "../hooks/use-auth-flow"
import { CredentialsForm } from "./credentials-form"
import { OtpForm } from "./otp-form"

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3.02h3.86c2.26-2.09 3.56-5.17 3.56-8.89z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.86-3.02c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.12A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.26A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.55.37-2.26V6.62H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.12z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.12C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}

function AuthSkeleton() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4 sm:p-8">
      <div className="auth-panel w-full max-w-[27rem] overflow-hidden border border-[var(--auth-line-strong)]">
        <div className="flex items-center justify-between border-b border-[var(--auth-line-strong)] px-4 py-2.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-[var(--auth-muted)]">
          <span>01 / Access</span>
          <span>Checking session</span>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="h-2 w-16 animate-pulse bg-[var(--auth-line-strong)]" />
          <div className="h-7 w-2/3 animate-pulse bg-[var(--auth-line)]" />
          <div className="h-3 w-1/2 animate-pulse bg-[var(--auth-line)]" />
          <div className="space-y-3 pt-2">
            <div className="h-9 animate-pulse bg-[var(--auth-surface-raised)]" />
            <div className="h-9 animate-pulse bg-[var(--auth-surface-raised)]" />
            <div className="h-9 animate-pulse bg-[var(--auth-accent)] opacity-30" />
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthPanel({ flow }: { flow: AuthFlow }) {
  const { mode, step, otpPurpose, email, formError, notice, pending } = flow
  const isForm = step === "form"

  const eyebrow = isForm ? "Credentials" : "Verification"
  const title = isForm
    ? mode === "signin"
      ? "Sign in to your workspace"
      : "Create your account"
    : otpPurpose === "signup"
      ? "Check your email"
      : "Enter your sign-in code"

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4 sm:p-8">
      <section className="auth-panel w-full max-w-[27rem] overflow-hidden border border-[var(--auth-line-strong)] shadow-[0_30px_80px_-48px_var(--auth-line-strong)]">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--auth-line-strong)] bg-[var(--auth-surface)] px-4 py-2.5">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-[var(--auth-muted)]">
            01 / Access
          </span>
          <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-[var(--auth-muted)]">
            <span
              className="size-1.5 rounded-full bg-[var(--auth-accent)]"
              aria-hidden="true"
            />
            Session none
          </span>
        </header>

        <div key={`${step}-${mode}`} className="auth-step space-y-6 p-5 sm:p-6">
          <div className="space-y-2">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-[var(--auth-accent)]">
              {eyebrow}
            </p>
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--auth-ink)]">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-[var(--auth-muted)]">
              {isForm ? (
                mode === "signin" ? (
                  "Use your email and password, a one-time code, or Google."
                ) : (
                  "We'll email a six-digit code to confirm your address."
                )
              ) : (
                <>
                  We sent a {otpPurpose === "signup" ? "verification" : "sign-in"} code to{" "}
                  <span className="font-mono text-[var(--auth-ink)]">{email}</span>.
                </>
              )}
            </p>
          </div>

          {formError ? (
            <Alert
              variant="destructive"
              role="alert"
              className="border-destructive/40 bg-[var(--auth-surface-raised)]"
            >
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : notice ? (
            <Alert
              role="status"
              aria-live="polite"
              className="border-[var(--auth-line-strong)] bg-[var(--auth-surface-raised)] text-[var(--auth-ink)]"
            >
              <AlertDescription className="text-[var(--auth-muted)]">
                {notice}
              </AlertDescription>
            </Alert>
          ) : null}

          {isForm ? <CredentialsForm flow={flow} /> : <OtpForm flow={flow} />}

          {isForm ? (
            <>
              <div className="flex items-center gap-3">
                <Separator className="flex-1 bg-[var(--auth-line-strong)]" />
                <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--auth-muted)]">
                  or
                </span>
                <Separator className="flex-1 bg-[var(--auth-line-strong)]" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={flow.continueWithGoogle}
                disabled={pending !== null}
                className="w-full border-[var(--auth-line-strong)] bg-[var(--auth-surface-raised)] text-[var(--auth-ink)] hover:bg-[var(--auth-ink)]/5"
              >
                <GoogleIcon />
                {pending === "google" ? "Opening Google..." : "Continue with Google"}
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={flow.requestCode}
                  disabled={pending !== null}
                  className="text-[var(--auth-muted)] underline-offset-4 hover:text-[var(--auth-ink)] hover:underline disabled:opacity-60"
                >
                  Email me a code
                </button>
                <button
                  type="button"
                  onClick={() => flow.switchMode(mode === "signin" ? "signup" : "signin")}
                  disabled={pending !== null}
                  className="text-[var(--auth-ink)] underline-offset-4 hover:underline disabled:opacity-60"
                >
                  {mode === "signin" ? "Create an account" : "I already have an account"}
                </button>
              </div>
            </>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-[var(--auth-line-strong)] bg-[var(--auth-surface)] px-4 py-2 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--auth-muted)]">
          <span>Auth / Email + Google</span>
          <span>Deep Agent / v1</span>
        </footer>
      </section>
    </div>
  )
}

export function AuthPage() {
  const flow = useAuthFlow()

  if (flow.session.data) {
    return <Navigate to="/" replace />
  }

  if (flow.session.isPending) {
    return <AuthSkeleton />
  }

  return <AuthPanel flow={flow} />
}
