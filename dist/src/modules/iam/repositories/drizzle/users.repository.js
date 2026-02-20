import { db } from "src/shared/db/client";
import { users } from "src/shared/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
export class DrizzleUsersRepository {
    async findByEmail(email, executor = db) {
        const result = await executor
            .select({
            id: users.id,
            isActive: users.isActive,
            email: users.email,
            passwordHash: users.passwordHash,
        })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        return result[0] ?? null;
    }
    async findById(id, executor = db) {
        const result = await executor
            .select({
            id: users.id,
            isActive: users.isActive,
            email: users.email,
            passwordHash: users.passwordHash,
        })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return result[0] ?? null;
    }
    async create(data, executor = db) {
        const id = randomUUID();
        await executor.insert(users).values({ id, ...data });
        return { id };
    }
}
