import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { GetMembersService } from "../services/getMembers.service";

export function makeGetMembersService() {
  return new GetMembersService(new DrizzleMembershipsRepository());
}
