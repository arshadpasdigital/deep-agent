import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { UserService } from "./user.service.js";

export class UserController {
  constructor(private readonly userService: UserService) {}

  getSession = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.userService.getSession(fromNodeHeaders(request.headers));
      if (!session) {
        response.status(401).json({ success: false, error: { code: "unauthorized", message: "No active session" } });
        return;
      }
      response.json({ success: true, message: "Session fetched", data: session });
    } catch (error) {
      next(error);
    }
  };

  getUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.userService.getSession(fromNodeHeaders(request.headers));
      if (!session) {
        response.status(401).json({ success: false, error: { code: "unauthorized", message: "No active session" } });
        return;
      }
      response.json({ success: true, message: "User fetched", data: session.user });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
      const user = await this.userService.getUserById(id);
      if (!user) {
        response.status(404).json({ success: false, error: { code: "user_not_found", message: "User not found" } });
        return;
      }
      response.json({ success: true, message: "User fetched", data: user });
    } catch (error) {
      next(error);
    }
  };
}
