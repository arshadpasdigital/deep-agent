import express from "express";
import { UserModule } from "./dependency.js";

export const userRouter = express.Router();
const { controller } = UserModule.getInstance();

userRouter.get("/session", controller.getSession);
userRouter.get("/me", controller.getUser);
userRouter.get("/:id", controller.getUserById);
