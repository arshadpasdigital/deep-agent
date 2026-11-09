import { Button } from "@/components/ui/button"
import type { AuthFlow } from "../hooks/use-auth-flow"
import { FieldRow } from "./field-row"

export function CredentialsForm({ flow }: { flow: AuthFlow }) {
  const {
    mode,
    name,
    email,
    password,
    fieldErrors,
    pending,
    setName,
    setEmail,
    setPassword,
    clearFieldError,
    submitCredentials,
  } = flow

  const busy = pending === "password"

  return (
    <form className="space-y-4" onSubmit={submitCredentials} noValidate aria-busy={pending !== null}>
      {mode === "signup" ? (
        <FieldRow
          id="name"
          label="Name"
          value={name}
          error={fieldErrors.name}
          autoComplete="name"
          placeholder="Ada Lovelace"
          onChange={(event) => {
            setName(event.target.value)
            clearFieldError("name")
          }}
        />
      ) : null}

      <FieldRow
        id="email"
        label="Email"
        type="email"
        value={email}
        error={fieldErrors.email}
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        onChange={(event) => {
          setEmail(event.target.value)
          clearFieldError("email")
        }}
      />

      <FieldRow
        id="password"
        label="Password"
        type="password"
        value={password}
        error={fieldErrors.password}
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
        onChange={(event) => {
          setPassword(event.target.value)
          clearFieldError("password")
        }}
      />

      <Button
        type="submit"
        size="lg"
        disabled={pending !== null}
        className="w-full bg-[var(--auth-accent)] text-[var(--auth-accent-ink)] hover:bg-[var(--auth-accent)]/90"
      >
        {busy
          ? mode === "signin"
            ? "Signing in..."
            : "Creating account..."
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  )
}
