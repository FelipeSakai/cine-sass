import { db } from "src/shared/db/client";
import { DrizzleMembershipsRepository } from "../repositories/drizzle/memberships.repository";
import { DrizzleTenantsRepository } from "../repositories/drizzle/tenants.repository";
import { DrizzleUsersRepository } from "../repositories/drizzle/users.repository";
import { CreateTenantOwnerService } from "../services/createTenantOwner.service";
export function makeCreateTenantOwnerService() {
    const tenantsRepo = new DrizzleTenantsRepository();
    const usersRepo = new DrizzleUsersRepository();
    const membershipsRepo = new DrizzleMembershipsRepository();
    return new CreateTenantOwnerService(db, tenantsRepo, usersRepo, membershipsRepo);
}
