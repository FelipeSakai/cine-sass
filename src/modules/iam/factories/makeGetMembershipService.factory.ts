import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { GetMembershipService } from "../services/getMembership.service";

export function makeGetMembershipService() {
  const membershipsRepo = new DrizzleMembershipsRepository();
  return new GetMembershipService(membershipsRepo);
}
