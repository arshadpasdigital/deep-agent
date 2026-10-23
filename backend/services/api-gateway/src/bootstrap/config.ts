import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV:z.enum(["development","testing",'production']),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(100).max(120_000).default(10_000),
  AUTH_SERVICE_URL: z.url().default("http://auth-service:3000"),
  NOTIFICATION_SERVICE_URL: z.url().default("http://notification-service:3000"),
  DEEPAGENT_SERVICE_URL: z.url().default("http://deepagent-service:3000"),
  ORIGIN:z.url(),
  GRPC_AUTH_PORT:z.coerce.number().int(),
});

export function parseConfig(environment: Record<string, string | undefined>) {
  const result = environmentSchema.safeParse(environment);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid API Gateway environment:\n${issues}`);
  }

  return result.data;
}

export const env = parseConfig(process.env);
export type EnvType = typeof env;
