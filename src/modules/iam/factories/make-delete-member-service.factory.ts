import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { DeleteMemberService } from "../services/delete-member.service";

export function makeDeleteMemberService() {
  return new DeleteMemberService(new DrizzleMembershipsRepository());
}
