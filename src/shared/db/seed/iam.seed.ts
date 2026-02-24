import { db } from "../client";
import { memberships, tenants, users } from "../schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function seedIam() {
  console.log("seeding db...");

  const tenantSlug = "cinema-test";
  const adminEmail = "admin@cinema.com";

  const existingTenant = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);

  const tenantId = existingTenant[0]?.id ?? randomUUID();

  if (!existingTenant[0]) {
    await db.insert(tenants).values({
      id: tenantId,
      name: "Cinema Test",
      slug: tenantSlug,
    });
  }

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  const userId = existingUser[0]?.id ?? randomUUID();
  const passwordHash = await bcrypt.hash("admin123", 10);

  if (!existingUser[0]) {
    await db.insert(users).values({
      id: userId,
      email: adminEmail,
      passwordHash,
    });
  }

  await db
    .insert(memberships)
    .values({
      tenantId,
      userId,
      role: "OWNER",
    })
    .onConflictDoUpdate({
      target: [memberships.tenantId, memberships.userId],
      set: { role: "OWNER" },
    });

  console.log("Seed completed");
}
