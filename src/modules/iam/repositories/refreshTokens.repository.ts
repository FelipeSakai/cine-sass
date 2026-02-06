import { DbExecutor } from "./iam.repositories";

export type RefreshTokenCreateData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type RefreshTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
};

export interface RefreshTokenRepository {
  create(
    data: RefreshTokenCreateData,
    executor?: DbExecutor,
  ): Promise<RefreshTokenRecord>;
  findByTokenHash(
    tokenHash: string,
    executor?: DbExecutor,
  ): Promise<RefreshTokenRecord | null>;
  revoke(
    tokenId: string,
    data: { revokedAt: Date; replacedByTokenId?: string | null },
    executor?: DbExecutor,
  ): Promise<void>;
}
