import type { UserRepository } from "./user.repository.js";
import type { UserDocument } from "./user.schema.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getSession(headers: Headers) {
    const { AuthProvider } = await import("../../bootstrap/auth.js");
    const auth = await AuthProvider.getInstance();
    return auth.api.getSession({ headers });
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }
}
