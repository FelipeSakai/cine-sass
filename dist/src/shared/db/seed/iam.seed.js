import { db } from "../client";
import { memberships, tenants, users } from "../schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
export async function seedIam() {
    console.log("seeding db...");
    const tenantId = randomUUID();
    await db.insert(tenants).values({
        id: tenantId,
        name: "Cinema Test",
        slug: "cinema-test",
    });
    const userId = randomUUID();
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
        id: userId,
        email: "admin@cinema.com",
        passwordHash,
    });
    await db.insert(memberships).values({
        tenantId,
        userId,
        role: "OWNER",
    });
    console.log("Seed completed");
}
