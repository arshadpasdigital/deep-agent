import express, { type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { HealthResponse } from "@packages/contracts/src/index.js";
import { createInternalEmailRouter, emailRouter } from "@/features/email/email.router.js";

type CreateAppOptions = {
  featureRouter?: express.Router;
  internalRouter?: express.Router;
  logStream?: { write: (line: string) => unknown };
};

export function createApp({
  featureRouter = emailRouter,
  internalRouter = createInternalEmailRouter(),
  logStream = process.stdout,
}: CreateAppOptions = {}) {
  const app = express();

  app.use(helmet());
  app.use(morgan("tiny", { stream: logStream }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/health", (_request: Request, response: Response) => {
    const body: HealthResponse = { service: "notification-service", status: "ok", runtime: "bun" };
    response.json(body);
  });
  app.use("/internal", internalRouter);
  app.use("/api/v1/notifications", featureRouter);

  return app;
}
