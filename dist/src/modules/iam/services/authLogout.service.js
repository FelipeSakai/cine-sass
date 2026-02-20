import crypto from "node:crypto";
export default class AuthLogoutService {
    refreshTokensRepo;
    constructor(refreshTokensRepo) {
        this.refreshTokensRepo = refreshTokensRepo;
    }
    async execute(input) {
        const raw = input.refreshToken?.trim();
        if (!raw)
            return;
        const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
        const token = await this.refreshTokensRepo.findByTokenHash(tokenHash);
        if (!token)
            return;
        await this.refreshTokensRepo.revoke(token.id, { revokedAt: new Date() });
    }
}
