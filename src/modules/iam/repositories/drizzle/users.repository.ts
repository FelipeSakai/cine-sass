import { db } from "src/shared/db/client";
import { UserInsert, UsersRepository } from "../iam.repositories";
import { users } from "src/shared/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export class DrizzleUsersRepository implements UsersRepository {
  async findByEmail(email: string): Promise<{ id: string } | null> {
    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async create(data: UserInsert) {
    const id = randomUUID();
    await db.insert(users).values({ id, ...data });
    return { id };
  }
}
