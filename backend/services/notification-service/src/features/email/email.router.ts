import express from "express";
import { EmailController } from "./email.controller.js";
import { EmailService } from "./email.service.js";

export function createEmailRouter(controller: EmailController): express.Router {
  const router = express.Router();
  router.post("/emails", controller.send);
  return router;
}

export function createInternalEmailRouter(): express.Router {
  return createEmailRouter(new EmailController(new EmailService()));
}

export const emailRouter = express.Router();
emailRouter.use((_request, response) => {
  response.status(501).json({ error: "not_implemented", service: "notification-service" });
});
