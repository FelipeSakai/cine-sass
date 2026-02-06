import { db } from "src/shared/db/client";
import { DbExecutor } from "../iam.repositories";
import {
  RefreshTokenCreateData,
  RefreshTokenRepository,
} from "../refreshTokens.repository";
import { refreshTokens } from "src/shared/db/schema";
import { eq } from "drizzle-orm";

export class DrizzleRefreshTokensRepository implements RefreshTokenRepository {
  private getExecutor(executor?: DbExecutor) {
    return executor ?? db;
  }

  async create(data: RefreshTokenCreateData, executor: DbExecutor) {
    const [row] = await executor
      .insert(refreshTokens)
      .values({
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      })
      .returning();

    return row;
  }

  async findByTokenHash(tokenHash: string, executor: DbExecutor) {
    const [row] = await executor
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    return row ?? null;
  }

  async revoke(
    tokenId: string,
    data: { revokedAt: Date; replacedByTokenId?: string | null },
    executor: DbExecutor,
  ) {
    await executor
      .update(refreshTokens)
      .set({
        revokedAt: data.revokedAt,
        replacedByTokenId: data.replacedByTokenId ?? null,
      })
      .where(eq(refreshTokens.id, tokenId));
  }
}
