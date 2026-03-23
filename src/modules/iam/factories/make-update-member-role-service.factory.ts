import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { UpdateMemberRoleService } from "../services/update-member-role.service";

export function makeUpdateMemberRoleService() {
  return new UpdateMemberRoleService(new DrizzleMembershipsRepository());
}
