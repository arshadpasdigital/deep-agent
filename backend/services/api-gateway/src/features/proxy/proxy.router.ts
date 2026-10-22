import type { HealthResponse } from "../../../../../packages/contracts/src/index.ts";
import { forwardRequest } from "./proxy.controller.ts";

export async function routeRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/health") {
    const response: HealthResponse = { service: "api-gateway", status: "ok", runtime: "bun" };
    return Response.json(response);
  }

  return forwardRequest(request);
}
