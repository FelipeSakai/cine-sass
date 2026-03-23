import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";
import { CreateMemberService } from "../services/create-member.service";

export function makeCreateMemberService() {
  return new CreateMemberService(
    new DrizzleUsersRepository(),
    new DrizzleMembershipsRepository(),
  );
}
