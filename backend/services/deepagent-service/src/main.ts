import type { HealthResponse } from "../../../packages/contracts/src/index.ts";
import { config } from "./bootstrap/config.ts";

export function handleRequest(request: Request): Response {
  const url = new URL(request.url);
  if (url.pathname === "/health") {
    const response: HealthResponse = { service: "deepagent-service", status: "ok", runtime: "bun" };
    return Response.json(response);
  }
  return Response.json({ error: "not_implemented", service: "deepagent-service" }, { status: 501 });
}

if (import.meta.main) {
  Bun.serve({ hostname: "0.0.0.0", port: config.port, fetch: handleRequest });
  console.info(`deepagent-service listening on port ${config.port}`);
}
