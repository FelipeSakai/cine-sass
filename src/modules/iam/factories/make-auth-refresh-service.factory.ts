import type { FastifyInstance } from "fastify";

import { db } from "src/shared/db/client";
import { DrizzleRefreshTokensRepository } from "../repositories/drizzle/refresh-tokens.repository";
import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";
import { AuthRefreshService } from "../services/auth-refresh.service";

export function makeAuthRefreshService(app: FastifyInstance) {
  const refreshTokensRepo = new DrizzleRefreshTokensRepository();
  const usersRepo = new DrizzleUsersRepository();

  return new AuthRefreshService(db, usersRepo, refreshTokensRepo, (payload) =>
    app.jwt.sign(payload),
  );
}
