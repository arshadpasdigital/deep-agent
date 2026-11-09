export function installGracefulShutdown(server, {
  timeoutMs = 10_000,
  signals = process,
  onExit = (code) => process.exit(code),
  logger = console,
  onShutdown = async () => {},
} = {}) {
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`deepagent-service received ${signal}; draining HTTP requests`);

    const timeout = setTimeout(() => {
      logger.error(`deepagent-service shutdown exceeded ${timeoutMs}ms`);
      onExit(1);
    }, timeoutMs);
    timeout.unref?.();

    server.close(async (error) => {
      if (error) {
        clearTimeout(timeout);
        logger.error("deepagent-service failed to close its HTTP server", error);
        onExit(1);
        return;
      }

      try {
        await onShutdown();
        clearTimeout(timeout);
        logger.info("deepagent-service HTTP server closed");
        onExit(0);
      } catch (shutdownError) {
        clearTimeout(timeout);
        logger.error("deepagent-service failed to release resources", shutdownError);
        onExit(1);
      }
    });
  };

  const onSigint = () => shutdown("SIGINT");
  const onSigterm = () => shutdown("SIGTERM");
  signals.once("SIGINT", onSigint);
  signals.once("SIGTERM", onSigterm);

  return () => {
    signals.removeListener("SIGINT", onSigint);
    signals.removeListener("SIGTERM", onSigterm);
  };
}
