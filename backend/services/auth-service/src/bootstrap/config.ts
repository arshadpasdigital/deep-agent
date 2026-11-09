import { z } from "zod";

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "testing", "production"]),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    GRPC_AUTH_PORT: z.coerce.number().int(),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(100).max(120_000).default(10_000),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    MONGODB_URI: z.url().refine(
      (value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      { message: "must be a mongodb:// or mongodb+srv:// URL" },
    ),
    RABBITMQ_URL: z
      .url()
      .refine((value) => value.startsWith("amqp://") || value.startsWith("amqps://"), {
        message: "must be an amqp:// or amqps:// URL",
      })
      .default("amqp://deepagent:local-development-only@localhost:5672"),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    TRUSTED_ORIGINS: z.string().min(1).default("http://localhost:5173"),
    NOTIFICATION_SERVICE_URL: z.url().default("http://notification-service:3000"),
    INTERNAL_SERVICE_TOKEN: z.string().min(1).default("local-development-only"),
  })
  .superRefine((value, context) => {
    if (Boolean(value.GOOGLE_CLIENT_ID) !== Boolean(value.GOOGLE_CLIENT_SECRET)) {
      context.addIssue({
        code: "custom",
        path: ["GOOGLE_CLIENT_SECRET"],
        message: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set together",
      });
    }

    if (value.NODE_ENV === "production" && value.INTERNAL_SERVICE_TOKEN === "local-development-only") {
      context.addIssue({
        code: "custom",
        path: ["INTERNAL_SERVICE_TOKEN"],
        message: "INTERNAL_SERVICE_TOKEN must be set in production",
      });
    }
  });

export type EnvType = z.infer<typeof environmentSchema>;

export function parseConfig(environment: Record<string, string | undefined>) {
  const result = environmentSchema.safeParse(environment);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid Auth Service environment:\n${issues}`);
  }

  return result.data;
}

let cachedEnv: EnvType | undefined;

export function getEnv(): EnvType {
  cachedEnv ??= parseConfig(process.env);
  return cachedEnv;
}
