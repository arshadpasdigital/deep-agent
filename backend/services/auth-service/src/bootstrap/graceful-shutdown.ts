export function installGracefulShutdown(server, {
  timeoutMs = 10_000,
  signals = process,
  onExit = (code) => process.exit(code),
  logger = console,
} = {}) {
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`auth-service received ${signal}; draining HTTP requests`);

    const timeout = setTimeout(() => {
      logger.error(`auth-service shutdown exceeded ${timeoutMs}ms`);
      onExit(1);
    }, timeoutMs);
    timeout.unref?.();

    server.close((error) => {
      clearTimeout(timeout);
      if (error) {
        logger.error("auth-service failed to close its HTTP server", error);
        onExit(1);
        return;
      }
      logger.info("auth-service HTTP server closed");
      onExit(0);
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
