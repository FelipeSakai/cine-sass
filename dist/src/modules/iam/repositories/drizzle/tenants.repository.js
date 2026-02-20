import { db } from "src/shared/db/client";
import { tenants } from "src/shared/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
export class DrizzleTenantsRepository {
    async findBySlug(slug, executor = db) {
        const result = await executor
            .select({ id: tenants.id })
            .from(tenants)
            .where(eq(tenants.slug, slug))
            .limit(1);
        return result[0] ?? null;
    }
    async create(data, executor = db) {
        const id = randomUUID();
        await executor.insert(tenants).values({ id, ...data });
        return { id };
    }
}
