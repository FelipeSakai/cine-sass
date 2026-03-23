import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";

export class GetMeService {
  constructor(private userRepo: DrizzleUsersRepository) {}

  async execute(userId: string) {
    return this.userRepo.findById(userId);
  }
}
