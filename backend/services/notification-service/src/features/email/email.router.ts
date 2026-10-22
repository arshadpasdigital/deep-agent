import express from "express";

export const emailRouter = express.Router();
emailRouter.use((_request, response) => {
  response.status(501).json({ error: "not_implemented", service: "notification-service" });
});
