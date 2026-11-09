import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL ?? "http://localhost:8080",
  fetchOptions: { credentials: "include" },
  plugins: [emailOTPClient()],
})

export type AuthSession = typeof authClient.$Infer.Session
