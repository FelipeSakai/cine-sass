import type { FastifyInstance } from "fastify";

import { db } from "src/shared/db/client";
import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { DrizzleRefreshTokensRepository } from "../repositories/drizzle/refreshTokens.repository";
import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";
import { AuthLoginService } from "../services/authLogin.service";
import { AuthRefreshService } from "../services/authRefresh.service";

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

export function makeAuthRefreshService(app: FastifyInstance) {
  const refreshTokensRepo = new DrizzleRefreshTokensRepository();
  const usersRepo = new DrizzleUsersRepository();

  return new AuthRefreshService(db, usersRepo, refreshTokensRepo, (payload) =>
    app.jwt.sign(payload),
  );
}
