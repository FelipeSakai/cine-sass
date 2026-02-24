import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";
import { GetMeService } from "../services/getMe.service";

export function makeGetMeService() {
  return new GetMeService(new DrizzleUsersRepository());
}
