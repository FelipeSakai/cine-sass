import { DbExecutor } from "./iam.repositories";

export type RefreshTokensCreateData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type RefreshsTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
};

export interface RefreshTokensRepository {
  create(
    data: RefreshTokensCreateData,
    executor?: DbExecutor,
  ): Promise<RefreshsTokenRecord>;
  findByTokenHash(
    tokenHash: string,
    executor?: DbExecutor,
  ): Promise<RefreshsTokenRecord | null>;
  revoke(
    tokenId: string,
    data: { revokedAt: Date; replacedByTokenId?: string | null },
    executor?: DbExecutor,
  ): Promise<void>;
}
