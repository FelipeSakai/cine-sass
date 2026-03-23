import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { GetMembersService } from "../services/get-members.service";

export function makeGetMembersService() {
  return new GetMembersService(new DrizzleMembershipsRepository());
}
