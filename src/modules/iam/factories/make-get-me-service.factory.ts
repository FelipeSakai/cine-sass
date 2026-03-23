import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";
import { GetMeService } from "../services/get-me.service";

export function makeGetMeService() {
  return new GetMeService(new DrizzleUsersRepository());
}
