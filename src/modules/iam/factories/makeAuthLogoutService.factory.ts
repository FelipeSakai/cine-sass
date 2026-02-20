import type { FastifyInstance } from "fastify";

import { DrizzleRefreshTokensRepository } from "../repositories/drizzle/refreshTokens.repository";
import AuthLogoutService from "../services/authLogout.service";

export function makeAuthLogoutService(app: FastifyInstance) {
  const refreshTokensRepo = new DrizzleRefreshTokensRepository();
  return new AuthLogoutService(refreshTokensRepo);
}
