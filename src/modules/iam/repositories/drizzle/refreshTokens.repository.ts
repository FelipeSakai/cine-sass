import { db } from "src/shared/db/client";
import { DbExecutor } from "../iam.repositories";
import {
  RefreshTokensCreateData,
  RefreshTokensRepository,
} from "../refreshTokens.repository";
import { refreshTokens } from "src/shared/db/schema";
import { eq } from "drizzle-orm";

export class DrizzleRefreshTokensRepository implements RefreshTokensRepository {
  private getExecutor(executor?: DbExecutor) {
    return executor ?? db;
  }

  async create(data: RefreshTokensCreateData, executor?: DbExecutor) {
    const dbExecutor = this.getExecutor(executor);
    const [row] = await dbExecutor
      .insert(refreshTokens)
      .values({
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      })
      .returning();

    return row;
  }

  async findByTokenHash(tokenHash: string, executor?: DbExecutor) {
    const dbExecutor = this.getExecutor(executor);
    const [row] = await dbExecutor
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    return row ?? null;
  }

  async revoke(
    tokenId: string,
    data: { revokedAt: Date; replacedByTokenId?: string | null },
    executor?: DbExecutor,
  ) {
    const dbExecutor = this.getExecutor(executor);
    await dbExecutor
      .update(refreshTokens)
      .set({
        revokedAt: data.revokedAt,
        replacedByTokenId: data.replacedByTokenId ?? null,
      })
      .where(eq(refreshTokens.id, tokenId));
  }
}
