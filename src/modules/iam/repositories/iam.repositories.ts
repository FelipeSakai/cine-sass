import { type InferInsertModel } from "drizzle-orm";
import { memberships, tenants, users } from "../../../shared/db/schema";
import { db } from "src/shared/db/client";
import { membershipRole } from "../dtos/auth.dto";

export type TenantInsert = InferInsertModel<typeof tenants>;
export type UserInsert = InferInsertModel<typeof users>;
export type MembershipInsert = InferInsertModel<typeof memberships>;

export type MembershipSummary = {
  tenantId: string;
  role: membershipRole;
};

export type MembershipDetails = {
  id: string;
  tenantId: string;
  userId: string;
  role: membershipRole;
};

export type DbExecutor = Omit<typeof db, "$client">;

export interface TenantsRepository {
  create(
    data: Omit<TenantInsert, "id">,
    executor?: DbExecutor,
  ): Promise<{ id: string }>;
  findBySlug(
    slug: string,
    executor?: DbExecutor,
  ): Promise<{ id: string } | null>;
}

export interface UsersRepository {
  create(
    data: Omit<UserInsert, "id">,
    executor?: DbExecutor,
  ): Promise<{ id: string }>;
  findByEmail(
    email: string,
    executor?: DbExecutor,
  ): Promise<{
    id: string;
    email: string;
    isActive: boolean;
    passwordHash: string;
  } | null>;
  findById(
    id: string,
    executor?: DbExecutor,
  ): Promise<{
    id: string;
    email: string;
    isActive: boolean;
    passwordHash: string;
  } | null>;
}

export interface MembershipsRepository {
  create(
    data: Omit<MembershipInsert, "id">,
    executor?: DbExecutor,
  ): Promise<{ id: string }>;
  findManyByUserId(
    UserId: string,
    executor?: DbExecutor,
  ): Promise<MembershipSummary[]>;
  findByTenantAndUser(
    tenantId: string,
    userId: string,
    executor?: DbExecutor,
  ): Promise<MembershipDetails | null>;
}
