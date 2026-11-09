import { toNodeHandler } from "better-auth/node";
import { createApp } from "@/bootstrap/app.js";
import { AuthProvider } from "@/bootstrap/auth.js";
import { getEnv } from "@/bootstrap/config.js";
import { installGracefulShutdown } from "@/bootstrap/graceful-shutdown.js";

if (import.meta.main) {
  const env = getEnv();
  const auth = await AuthProvider.getInstance();
  const server = createApp({ authHandler: toNodeHandler(auth) }).listen(env.PORT, "0.0.0.0", () => {
    console.info(`auth-service listening on port ${env.PORT}`);
  });
  installGracefulShutdown(server, { timeoutMs: env.SHUTDOWN_TIMEOUT_MS });
}
