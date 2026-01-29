export type CreateTenantOwnerInput = {
  tenantName: string;
  tenantSlug: string;
  ownerEmail: string;
  ownerPassword: string;
};

export type CreateTenantOwnerOutput = {
  tenantId: string;
  userId: string;
  membershipId?: string;
};
