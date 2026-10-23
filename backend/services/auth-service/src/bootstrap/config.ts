import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV:z.enum(["development","testing",'production']),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  GRPC_AUTH_PORT:z.coerce.number().int(),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(100).max(120_000).default(10_000),
  BETTER_AUTH_SECRET:z.string(),
  BETTER_AUTH_URL:z.url(),  
  MONGODB_URI: z.url().refine((value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"), {
    message: "must be a mongodb:// or mongodb+srv:// URL",
  }),
  RABBITMQ_URL: z.url().refine((value) => value.startsWith("amqp://") || value.startsWith("amqps://"), {
    message: "must be an amqp:// or amqps:// URL",
  }).default("amqp://deepagent:local-development-only@localhost:5672"),
});




export function parseConfig(environment: Record<string, string | undefined>) {
  const result = environmentSchema.safeParse(environment);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid Auth Service environment:\n${issues}`);
  }

  const { PORT, SHUTDOWN_TIMEOUT_MS, MONGODB_URI, RABBITMQ_URL } = result.data;
  return result.data
}

export const env = parseConfig(process.env);
export type EnvType = typeof env;
