import { db } from "src/shared/db/client";
import { TenantInsert, TenantsRepository, type DbExecutor } from "../iam.repositories";
import { tenants } from "src/shared/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export class DrizzleTenantsRepository implements TenantsRepository {
  async findBySlug(slug: string, executor: DbExecutor = db) {
    const result = await executor
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: TenantInsert, executor: DbExecutor = db) {
    const id = randomUUID();
    await executor.insert(tenants).values({ id, ...data });
    return { id };
  }
}
