import { db } from "src/shared/db/client";
import { Role } from "../domain/role";
import type {
  CreateMemberInput,
  CreateMemberOutput,
} from "../dtos/create-member.dto";
import {
  DbExecutor,
  MembershipsRepository,
  UsersRepository,
} from "../repositories/iam.repositories";
import bcrypt from "bcryptjs";

export class CreateMemberService {
  constructor(
    private usersRepo: UsersRepository,
    private membershipsRepo: MembershipsRepository,
  ) {}

  async execute(input: CreateMemberInput): Promise<CreateMemberOutput> {
    if (
      input.actorRole === Role.ADMIN &&
      (input.role === Role.ADMIN || input.role === Role.OWNER)
    ) {
      return {
        ok: false,
        status: 403,
        message: "Forbidden",
      };
    }
    return db.transaction(async (tx: DbExecutor) => {
      const existing = await this.usersRepo.findByEmail(input.email, tx);

      let userId = existing?.id;

      if (!userId) {
        const passwordHash = await bcrypt.hash(input.password, 8);
        const created = await this.usersRepo.create(
          { email: input.email, passwordHash, isActive: true },
          tx,
        );
        userId = created.id;
      }
      const already = await this.membershipsRepo.findByTenantAndUser(
        input.tenantId,
        userId,
        tx,
      );
      if (already) {
        return {
          ok: false,
          status: 409,
          message: "Member already exists",
        };
      }
      const membership = await this.membershipsRepo.create(
        {
          tenantId: input.tenantId,
          userId: userId,
          role: input.role as Role,
        },
        tx,
      );
      return {
        ok: true as const,
        userId,
        membershipId: membership.id,
        role: input.role as Role,
      };
    });
  }
}
