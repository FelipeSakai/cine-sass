import { afterAll, beforeEach } from "vitest";
import { db, pool } from "../src/shared/db/client";

beforeEach(async () => {
  await db.execute(`
    TRUNCATE TABLE
        iam.memberships,
        iam.users,
        iam.tenants
    CASCADE;
    `);
});

afterAll(async () => {
  await pool.end();
});
