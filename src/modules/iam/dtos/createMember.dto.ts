import { Role } from "../domain/role";

export type CreateMemberInput = {
  tenantId: string;
  actorRole: Role;
  email: string;
  password: string;
  role: Role;
};

export type CreateMemberOutput =
  | { ok: true; userId: string; membershipId: string; role: Role }
  | { ok: false; status: 403 | 409; message: string };
