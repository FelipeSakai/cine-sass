import type { FastifyInstance } from "fastify";

import { DrizzleRefreshTokensRepository } from "../repositories/drizzle/refresh-tokens.repository";
import AuthLogoutService from "../services/auth-logout.service";

export function makeAuthLogoutService(app: FastifyInstance) {
  const refreshTokensRepo = new DrizzleRefreshTokensRepository();
  return new AuthLogoutService(refreshTokensRepo);
}
