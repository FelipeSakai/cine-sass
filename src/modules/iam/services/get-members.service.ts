import { MembershipsRepository } from "../repositories/contracts";

export class GetMembersService {
  constructor(private membershipRepo: MembershipsRepository) {}

  async execute(tenantId: string) {
    return this.membershipRepo.findManyByTenantId(tenantId);
  }
}
