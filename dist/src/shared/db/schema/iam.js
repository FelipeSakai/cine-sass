import { boolean, index, pgEnum, pgSchema, text, timestamp, uniqueIndex, uuid, } from "drizzle-orm/pg-core";
export const iam = pgSchema("iam");
export const membershipRole = pgEnum("membership_role", [
    "OWNER",
    "ADMIN",
    "STAFF",
    "VIEWER",
]);
export const tenants = iam.table("tenants", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (t) => [uniqueIndex("tenants_slug_uq").on(t.slug)]);
export const users = iam.table("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (t) => [uniqueIndex("users_email_uq").on(t.email)]);
export const memberships = iam.table("memberships", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    role: membershipRole("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (t) => [uniqueIndex("memberships_tenant_user_uq").on(t.tenantId, t.userId)]);
export const refreshTokens = iam.table("refresh_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    replacedByTokenId: uuid("replaced_by_token_id"),
}, (t) => [
    index("refresh_token_user_id_idx").on(t.userId),
    uniqueIndex("refresh_tokens_token_hash_uq").on(t.tokenHash),
]);
