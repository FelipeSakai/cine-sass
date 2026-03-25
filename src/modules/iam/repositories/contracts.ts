import { type InferInsertModel } from "drizzle-orm";
import { memberships, tenants, users } from "../../../shared/db/schema";
import { db } from "src/shared/db/client";
import { Role } from "../domain/role";

export type TenantInsert = InferInsertModel<typeof tenants>;
export type UserInsert = InferInsertModel<typeof users>;
export type MembershipInsert = InferInsertModel<typeof memberships>;

export type MembershipSummary = {
  tenantId: string;
  role: Role;
};

export type MembershipDetails = {
  id: string;
  tenantId: string;
  userId: string;
  role: Role;
};

export type TenantMemberListItem = {
  userId: string;
  email: string;
  role: Role;
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
    userId: string,
    executor?: DbExecutor,
  ): Promise<MembershipSummary[]>;
  findByTenantAndUser(
    tenantId: string,
    userId: string,
    executor?: DbExecutor,
  ): Promise<MembershipDetails | null>;
  findManyByTenantId(
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<TenantMemberListItem[]>;
  updateRole(
    tenantId: string,
    userId: string,
    role: Role,
    executor?: DbExecutor,
  ): Promise<void>;
  deleteByTenantAndUser(
    tenantId: string,
    userId: string,
    executor?: DbExecutor,
  ): Promise<void>;
}
