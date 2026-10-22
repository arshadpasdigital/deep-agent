import express,{type Request,type Response} from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { HealthResponse } from "@packages/contracts/src/index.js";
import { proxyRouter } from "@/features/proxy/proxy.router.js";

export function createApp({ apiRouter = proxyRouter, logStream = process.stdout } = {}) {
  const app = express();

  app.use(helmet());
  app.use(morgan("tiny", { stream: logStream }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/health", (_request:Request, response:Response) => {
    const body: HealthResponse = { service: "api-gateway", status: "ok", runtime: "bun" };
    response.json(body);
  });
  app.use("/api/v1", apiRouter);

  return app;
}
