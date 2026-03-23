import { MembershipsRepository } from "../repositories/iam.repositories";

interface GetMembershipServiceRequest {
  tenantId: string;
  userId: string;
}

export class GetMembershipService {
  constructor(private membershipsRepository: MembershipsRepository) {}

  async execute({ tenantId, userId }: GetMembershipServiceRequest) {
    return this.membershipsRepository.findByTenantAndUser(tenantId, userId);
  }
}
