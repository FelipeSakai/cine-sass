import crypto from "node:crypto";
import { LogoutInput } from "../dtos/auth-logout.dto";
import { RefreshTokensRepository } from "../repositories/refresh-tokens.repository";

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
