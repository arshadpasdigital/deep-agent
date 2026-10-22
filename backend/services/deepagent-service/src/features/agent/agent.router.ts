import express from "express";

export const agentRouter = express.Router();
agentRouter.use((_request, response) => {
  response.status(501).json({ error: "not_implemented", service: "deepagent-service" });
});
