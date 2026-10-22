import { env } from "@/bootstrap/config.js";

const upstreams = [
  { prefix: "/api/auth", baseUrl: env.AUTH_SERVICE_URL },
  { prefix: "/api/notifications", baseUrl: env.NOTIFICATION_SERVICE_URL },
  { prefix: "/api/agent", baseUrl: env.DEEPAGENT_SERVICE_URL },
] as const;

export async function forwardRequest(request: Request): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const upstream = upstreams.find(
    ({ prefix }) => incomingUrl.pathname === prefix || incomingUrl.pathname.startsWith(`${prefix}/`),
  );

  if (!upstream) {
    return Response.json({ error: "route_not_found" }, { status: 404 });
  }

  const targetUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, upstream.baseUrl);
  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    return await fetch(
      new Request(targetUrl, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual",
      }),
    );
  } catch {
    return Response.json({ error: "upstream_unavailable" }, { status: 502 });
  }
}
