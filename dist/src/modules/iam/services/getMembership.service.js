export class GetMembershipService {
    membershipsRepository;
    constructor(membershipsRepository) {
        this.membershipsRepository = membershipsRepository;
    }
    async execute({ tenantId, userId }) {
        return this.membershipsRepository.findByTenantAndUser(tenantId, userId);
    }
}
