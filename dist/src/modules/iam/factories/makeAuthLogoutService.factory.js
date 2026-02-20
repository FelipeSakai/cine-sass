import { DrizzleRefreshTokensRepository } from "../repositories/drizzle/refreshTokens.repository";
import AuthLogoutService from "../services/authLogout.service";
export function makeAuthLogoutService(app) {
    const refreshTokensRepo = new DrizzleRefreshTokensRepository();
    return new AuthLogoutService(refreshTokensRepo);
}
