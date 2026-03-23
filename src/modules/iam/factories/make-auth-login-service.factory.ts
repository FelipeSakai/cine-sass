import type { FastifyInstance } from "fastify";

import { db } from "src/shared/db/client";
import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { DrizzleRefreshTokensRepository } from "../repositories/drizzle/refresh-tokens.repository";
import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";
import { AuthLoginService } from "../services/auth-login.service";

export function makeAuthLoginService(app: FastifyInstance) {
  const usersRepo = new DrizzleUsersRepository();
  const membershipsRepo = new DrizzleMembershipsRepository();
  const refreshTokensRepo = new DrizzleRefreshTokensRepository();

  return new AuthLoginService(
    db,
    usersRepo,
    membershipsRepo,
    refreshTokensRepo,
    (payload) => app.jwt.sign(payload),
  );
}
