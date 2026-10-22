import { z } from "zod";

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(100).max(120_000).default(10_000),
  MONGODB_URI: z.url().refine((value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"), {
    message: "must be a mongodb:// or mongodb+srv:// URL",
  }),
});

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

export const env = parseConfig(process.env);
export type EnvType = typeof env;
