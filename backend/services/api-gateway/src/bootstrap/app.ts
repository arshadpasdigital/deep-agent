import express,{type Request,type Response} from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { HealthResponse } from "@packages/contracts/src/index.js";
import { proxyRouter } from "@/features/proxy/proxy.router.js";
import cors from 'cors';
import { env } from "./config.js";
import { startTaskServers } from "./grpc/gRPCServer.js";

export function createApp({ apiRouter = proxyRouter, logStream = process.stdout } = {}) {
  const app = express();

  startTaskServers();

  app.use(helmet());
  app.use(morgan("dev", { stream: logStream }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors({
    origin:env.ORIGIN,
    credentials:true,
    methods:["POST",'GET','PUT','PATCH','DELETE']
  }))

  app.get("/health", (_request:Request, response:Response) => {
    const body: HealthResponse = { service: "api-gateway", status: "ok", runtime: "bun" };
    response.status(200).json(body);
  });
  app.use("/api/v1", apiRouter);

  return app;
}
