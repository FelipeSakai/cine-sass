import { db } from "src/shared/db/client";
import { DrizzleRefreshTokensRepository } from "../repositories/drizzle/refreshTokens.repository";
import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";
import { AuthRefreshService } from "../services/authRefresh.service";
export function makeAuthRefreshService(app) {
    const refreshTokensRepo = new DrizzleRefreshTokensRepository();
    const usersRepo = new DrizzleUsersRepository();
    return new AuthRefreshService(db, usersRepo, refreshTokensRepo, (payload) => app.jwt.sign(payload));
}
