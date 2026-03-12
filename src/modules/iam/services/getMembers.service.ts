import { MembershipsRepository } from "../repositories/iam.repositories";

export class GetMembersService {
  constructor(private membershipRepo: MembershipsRepository) {}

  async execute(tenantId: string) {
    return this.membershipRepo.findManyByTenantId(tenantId);
  }
}
