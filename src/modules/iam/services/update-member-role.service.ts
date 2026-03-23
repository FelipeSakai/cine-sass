import { Role } from "../domain/role";
import type { MembershipsRepository } from "../repositories/iam.repositories";

type Result = { ok: true } | { ok: false; status: 403 | 404; message: string };

export class UpdateMemberRoleService {
  constructor(private membershipsRepo: MembershipsRepository) {}

  async execute(input: {
    tenantId: string;
    actorUserId: string;
    actorRole: Role;
    targetUserId: string;
    newRole: Role;
  }): Promise<Result> {
    const targetMembership = await this.membershipsRepo.findByTenantAndUser(
      input.tenantId,
      input.targetUserId,
    );

    if (!targetMembership) {
      return { ok: false, status: 404, message: "Member not found" };
    }

    if (input.newRole === Role.OWNER) {
      return { ok: false, status: 403, message: "Forbidden" };
    }

    if (input.actorUserId === input.targetUserId) {
      return { ok: false, status: 403, message: "Forbidden" };
    }

    if (input.actorRole === Role.ADMIN) {
      if (
        targetMembership.role === Role.OWNER ||
        targetMembership.role === Role.ADMIN
      ) {
        return { ok: false, status: 403, message: "Forbidden" };
      }

      if (input.newRole === Role.ADMIN) {
        return { ok: false, status: 403, message: "Forbidden" };
      }
    }

    await this.membershipsRepo.updateRole(
      input.tenantId,
      input.targetUserId,
      input.newRole,
    );

    return { ok: true };
  }
}
