import express from "express";

export const authRouter = express.Router();
authRouter.use((_request, response) => {
  response.status(501).json({ error: "not_implemented", service: "auth-service" });
});
