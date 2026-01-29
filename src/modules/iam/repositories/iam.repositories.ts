import { type InferInsertModel } from "drizzle-orm";
import { memberships, tenants, users } from "../../../shared/db/schema";

export type TenantInsert = InferInsertModel<typeof tenants>;
export type UserInsert = InferInsertModel<typeof users>;
export type MembershipInsert = InferInsertModel<typeof memberships>;

export interface TenantsRepository {
  create(data: Omit<TenantInsert, "id">): Promise<{ id: string }>;
  findBySlug(slug: string): Promise<{ id: string } | null>;
}

export interface UsersRepository {
  create(data: Omit<UserInsert, "id">): Promise<{ id: string }>;
  findByEmail(email: string): Promise<{ id: string } | null>;
}

export interface MembershipsRepository {
  create(data: Omit<MembershipInsert, "id">): Promise<{ id: string }>;
  findByTenantAndUser(
    tenantId: string,
    userId: string,
  ): Promise<{ id: string } | null>;
}
