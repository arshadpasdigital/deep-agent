import express, { type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import type { HealthResponse } from "@packages/contracts/src/index.js";
import { proxyRouter } from "@/features/proxy/proxy.router.js";
import { createAuthProxyRouter } from "@/features/proxy/auth.proxy.js";
import { getEnv, type EnvType } from "./config.js";

type AppConfig = Pick<EnvType, "ORIGIN" | "AUTH_SERVICE_URL">;

type CreateAppOptions = {
  apiRouter?: express.Router;
  authRouter?: express.RequestHandler;
  logStream?: { write: (line: string) => unknown };
  config?: AppConfig;
};

export function createApp({
  apiRouter = proxyRouter,
  authRouter,
  logStream = process.stdout,
  config = getEnv(),
}: CreateAppOptions = {}) {
  const app = express();

  app.use(helmet());
  app.use(morgan("dev", { stream: logStream }));
  app.use(
    cors({
      origin: config.ORIGIN,
      credentials: true,
      methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    }),
  );

  app.use(
    "/api/auth",
    authRouter ?? createAuthProxyRouter({ authServiceUrl: config.AUTH_SERVICE_URL }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/health", (_request: Request, response: Response) => {
    const body: HealthResponse = { service: "api-gateway", status: "ok", runtime: "bun" };
    response.status(200).json(body);
  });
  app.use("/api/v1", apiRouter);

  return app;
}
