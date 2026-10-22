function readPort(value: string | undefined, fallback: number): number {
  const port = Number(value ?? fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer from 1 to 65535; received: ${value}`);
  }
  return port;
}

function readServiceUrl(name: string, value: string | undefined, fallback: string): string {
  const serviceUrl = value ?? fallback;
  try {
    return new URL(serviceUrl).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${name} must be a valid absolute URL; received: ${serviceUrl}`);
  }
}

export const config = {
  port: readPort(Bun.env.PORT, 3000),
  authServiceUrl: readServiceUrl("AUTH_SERVICE_URL", Bun.env.AUTH_SERVICE_URL, "http://auth-service:3000"),
  notificationServiceUrl: readServiceUrl(
    "NOTIFICATION_SERVICE_URL",
    Bun.env.NOTIFICATION_SERVICE_URL,
    "http://notification-service:3000",
  ),
  deepagentServiceUrl: readServiceUrl(
    "DEEPAGENT_SERVICE_URL",
    Bun.env.DEEPAGENT_SERVICE_URL,
    "http://deepagent-service:3000",
  ),
};
