import { config } from "./bootstrap/config.ts";
import { routeRequest } from "./features/proxy/proxy.router.ts";

if (import.meta.main) {
  Bun.serve({
    hostname: "0.0.0.0",
    port: config.port,
    fetch: routeRequest,
  });

  console.info(`api-gateway listening on port ${config.port}`);
}
