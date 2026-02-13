import { afterAll, beforeEach } from "vitest";
import { db, pool } from "../src/shared/db/client";
import { sql } from "drizzle-orm";

beforeEach(async () => {
  await db.execute(sql`
    TRUNCATE TABLE
        iam.refresh_tokens,
        iam.memberships,
        iam.users,
        iam.tenants
    CASCADE;
    `);
});

afterAll(async () => {
  await pool.end();
});
