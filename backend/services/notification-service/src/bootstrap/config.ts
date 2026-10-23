import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV:z.enum(["development","testing",'production']),
  PORT: z.coerce.number().int(),
GRPC_NOTIFICATION_PORT:z.coerce.number().int(),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(100).max(120_000).default(10_000),
  EMAIL_HOST: z.string().trim().min(1).optional(),
  EMAIL_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  EMAIL_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  EMAIL_USER: z.string().trim().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().trim().min(1).optional(),
  RABBITMQ_URL: z.string().default("amqp://deepagent:local-development-only@localhost:5672"),
});



export function parseConfig(environment: Record<string, string | undefined>) {
  const result = environmentSchema.safeParse(environment);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid Notification Service environment:\n${issues}`);
  }

  return result.data;
}

export const env = parseConfig(process.env);
export type EnvType = typeof env;

