import { createApp } from "@/bootstrap/app.js";
import { getEnv } from "@/bootstrap/config.js";
import { installGracefulShutdown } from "@/bootstrap/graceful-shutdown.js";

if (import.meta.main) {
  const env = getEnv();
  const server = createApp().listen(env.PORT, "0.0.0.0", () => {
    console.info(`notification-service listening on port ${env.PORT}`);
  });
  installGracefulShutdown(server, { timeoutMs: env.SHUTDOWN_TIMEOUT_MS });
}
