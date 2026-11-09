import { z } from "zod";

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "testing", "production"]),
    PORT: z.coerce.number().int().min(1).max(65535).default(3002),
    GRPC_DEEP_AGENT_PORT: z.coerce.number().int(),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(100).max(120_000).default(10_000),
    MODEL_PROVIDER: z.string().optional(),
    MODEL_API_KEY: z.string().optional(),
    MEMORY_BACKEND: z.enum(["mongo", "memory"]).default("mongo"),
    MONGODB_URI: z.string().min(1).optional(),
    MEMORY_CHECKPOINT_DB: z.string().min(1).default("deepagent_checkpoints"),
    MEMORY_STORE_DB: z.string().min(1).default("deepagent_memory"),
  })
  .superRefine((value, context) => {
    if (value.MEMORY_BACKEND === "mongo" && !value.MONGODB_URI) {
      context.addIssue({
        code: "custom",
        path: ["MONGODB_URI"],
        message: "MONGODB_URI is required when MEMORY_BACKEND=mongo",
      });
    }

    if (value.NODE_ENV === "production" && value.MEMORY_BACKEND === "memory") {
      context.addIssue({
        code: "custom",
        path: ["MEMORY_BACKEND"],
        message: "MEMORY_BACKEND=memory is not allowed in production",
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
    throw new Error(`Invalid DeepAgent Service environment:\n${issues}`);
  }

  return result.data;
}

let cachedEnv: EnvType | undefined;

export function getEnv(): EnvType {
  cachedEnv ??= parseConfig(process.env);
  return cachedEnv;
}
