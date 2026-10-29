import express,{type Request,type RequestHandler,type Response} from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { HealthResponse } from "@packages/contracts/src/index.js";
import { authRouter } from "@/features/auth/auth.router.js";
import { userRouter } from "@/features/user/user.router.js";

type CreateAppOptions = {
  featureRouter?: express.Router;
  logStream?: { write: (line: string) => unknown };
  authHandler?: RequestHandler;
};

export function createApp({ featureRouter = authRouter, logStream = process.stdout, authHandler }: CreateAppOptions = {}) {
  const app = express();

  app.use(helmet());
  app.use(morgan("tiny", { stream: logStream }));

  if (authHandler) {
    app.all("/api/auth/*splat", authHandler);
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/health", (_request:Request, response:Response) => {
    const body: HealthResponse = { service: "auth-service", status: "ok", runtime: "bun" };
    response.json(body);
  });
  app.use("/api/v1/auth", featureRouter);
  app.use("/api/v1/users", userRouter);

  return app;
}
