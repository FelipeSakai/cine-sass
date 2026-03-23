import { Role } from "../domain/role";

export type AuthMembershipDTO = {
  tenantId: string;
  role: Role;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginOutput = {
  accessToken: string;
  refreshToken: string;
  memberships: AuthMembershipDTO[];
  defaultTenantId?: string;
};
