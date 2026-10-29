import { UserController } from "./user.controller.js";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";

export class UserModule {
  private static instance: UserModule | undefined;

  readonly controller: UserController;

  private constructor() {
    const repository = new UserRepository();
    const service = new UserService(repository);
    this.controller = new UserController(service);
  }

  static getInstance(): UserModule {
    UserModule.instance ??= new UserModule();
    return UserModule.instance;
  }
}
