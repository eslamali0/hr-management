import { injectable } from "inversify";
import { IPasswordService } from "../interfaces/IPasswordService";
import bcrypt from "bcryptjs";

@injectable()
export class BcryptPasswordService implements IPasswordService {
  private readonly SALT_ROUNDS = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
