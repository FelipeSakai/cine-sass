import crypto from "node:crypto";
import { LogoutInput } from "../dtos/authLogout.dto";
import { RefreshTokensRepository } from "../repositories/refreshTokens.repository";

export default class AuthLogoutService {
  constructor(private refreshTokensRepo: RefreshTokensRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    const raw = input.refreshToken?.trim();
    if (!raw) return;

    const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");

    const token = await this.refreshTokensRepo.findByTokenHash(tokenHash);
    if (!token) return;

    await this.refreshTokensRepo.revoke(token.id, { revokedAt: new Date() });
  }
}
