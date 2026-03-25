import type { UsersRepository } from "../repositories/contracts";

export class GetMeService {
  constructor(private userRepo: UsersRepository) {}

  async execute(userId: string) {
    return this.userRepo.findById(userId);
  }
}
