import { createApp } from "@/bootstrap/app.js";
import { getEnv } from "@/bootstrap/config.js";
import { installGracefulShutdown } from "@/bootstrap/graceful-shutdown.js";
import { getMemoryService } from "@/deep-agent-memory/memory.service.js";

if (import.meta.main) {
  const env = getEnv();
  const memory = getMemoryService();
  const server = createApp().listen(env.PORT, "0.0.0.0", () => {
    console.info(
      `deepagent-service listening on port ${env.PORT} (memory backend: ${memory.getBackendKind()})`,
    );
  });
  installGracefulShutdown(server, {
    timeoutMs: env.SHUTDOWN_TIMEOUT_MS,
    onShutdown: () => memory.close(),
  });
}
