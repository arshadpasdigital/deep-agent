import { createApp } from "@/bootstrap/app.js";
import { getEnv } from "@/bootstrap/config.js";
import { installGracefulShutdown } from "@/bootstrap/graceful-shutdown.js";
import { startTaskServers } from "@/bootstrap/grpc/gRPCServer.js";

if (import.meta.main) {
  const env = getEnv();
  startTaskServers();
  const server = createApp().listen(env.PORT, "0.0.0.0", () => {
    console.info(`api-gateway listening on port ${env.PORT}`);
  });
  installGracefulShutdown(server, { timeoutMs: env.SHUTDOWN_TIMEOUT_MS });
}
