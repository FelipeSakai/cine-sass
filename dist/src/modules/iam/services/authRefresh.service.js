import { ApiError } from "src/shared/errors/api-error";
import crypto from "node:crypto";
export class AuthRefreshService {
    db;
    usersRepo;
    refreshTokensRepo;
    signAccessToken;
    constructor(db, usersRepo, refreshTokensRepo, signAccessToken) {
        this.db = db;
        this.usersRepo = usersRepo;
        this.refreshTokensRepo = refreshTokensRepo;
        this.signAccessToken = signAccessToken;
    }
    async execute(input) {
        const raw = input.refreshToken?.trim();
        if (!raw)
            throw new ApiError("Refresh token is required", 400);
        const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
        const token = await this.refreshTokensRepo.findByTokenHash(tokenHash);
        if (!token)
            throw new ApiError("Invalid refresh token", 401);
        if (token.revokedAt)
            throw new ApiError("Refresh token revoked", 401);
        if (token.expiresAt.getTime() <= Date.now())
            throw new ApiError("Refresh token expired", 401);
        const user = await this.usersRepo.findById(token.userId);
        if (!user || !user.isActive)
            throw new ApiError("Invalid credentials", 401);
        const accessToken = await this.signAccessToken({ sub: user.id });
        const newRefreshToken = crypto.randomBytes(40).toString("hex");
        const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.db.transaction(async (tx) => {
            const created = await this.refreshTokensRepo.create({ userId: user.id, tokenHash: newRefreshTokenHash, expiresAt }, tx);
            await this.refreshTokensRepo.revoke(token.id, { revokedAt: new Date(), replacedByTokenId: created.id }, tx);
        });
        return { accessToken, refreshToken: newRefreshToken };
    }
}
