import { Role } from "../domain/role";
import type { MembershipsRepository } from "../repositories/iam.repositories";

type Result = { ok: true } | { ok: false; status: 403 | 404; message: string };

export class DeleteMemberService {
  constructor(private membershipsRepo: MembershipsRepository) {}

  async execute(input: {
    tenantId: string;
    actorUserId: string;
    actorRole: Role;
    targetUserId: string;
  }): Promise<Result> {
    const targetMembership = await this.membershipsRepo.findByTenantAndUser(
      input.tenantId,
      input.targetUserId,
    );

    if (!targetMembership) {
      return { ok: false, status: 404, message: "Member not found" };
    }

    if (input.actorUserId === input.targetUserId) {
      return { ok: false, status: 403, message: "Forbidden" };
    }

    if (targetMembership.role === Role.OWNER) {
      return { ok: false, status: 403, message: "Forbidden" };
    }

    if (
      input.actorRole === Role.ADMIN &&
      targetMembership.role === Role.ADMIN
    ) {
      return { ok: false, status: 403, message: "Forbidden" };
    }

    await this.membershipsRepo.deleteByTenantAndUser(
      input.tenantId,
      input.targetUserId,
    );

    return { ok: true };
  }
}
