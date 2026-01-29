import { db } from "src/shared/db/client";
import { TenantInsert, TenantsRepository } from "../iam.repositories";
import { tenants } from "src/shared/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export class DrizzleTenantsRepository implements TenantsRepository {
  async findBySlug(slug: string): Promise<{ id: string } | null> {
    const result = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: TenantInsert) {
    const id = randomUUID();
    await db.insert(tenants).values({ id, ...data });
    return { id };
  }
}
