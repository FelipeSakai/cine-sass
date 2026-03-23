import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { GetMembershipService } from "../services/get-membership.service";

export function makeGetMembershipService() {
  const membershipsRepo = new DrizzleMembershipsRepository();
  return new GetMembershipService(membershipsRepo);
}
