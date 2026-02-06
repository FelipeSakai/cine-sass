import { membershipRole } from "src/shared/db/schema";

export type membershipRole = (typeof membershipRole.enumValues)[number];

export type AuthMembershipDTO = {
  tenantId: string;
  role: membershipRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginOutput = {
  acessToken: string;
  refreshToken: string;
  memberships: AuthMembershipDTO[];
  defaultTenantId?: string;
};

export type refreshInput = {
  refreshToken: String;
};

export type refreshOutput = {
  acessToken: string;
  refreshToken: string;
};
