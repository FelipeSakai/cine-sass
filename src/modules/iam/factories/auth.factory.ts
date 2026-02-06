import { db } from "src/shared/db/client";
import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { DrizzleRefreshTokensRepository } from "../repositories/drizzle/refreshTokens.repository";
import { DrizzleTenantsRepository } from "../repositories/drizzle/tenants.repository";
import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";

export function makeAuthLoginService() {
  const usersRepo = new DrizzleUsersRepository();
  const membershipRepo = new DrizzleMembershipsRepository();
  const tenantRepo = new DrizzleTenantsRepository();

  //return new AuthLoginService(db, usersRepo, membershipRepo, refershTokensRepo);
}

export function makeAuthRefreshService() {
  const usersRepo = new DrizzleUsersRepository();
  const refershTokensRepo = new DrizzleRefreshTokensRepository();

  //return new makeAuthRefreshService(db, usersRepo, refershTokensRepo);
}
