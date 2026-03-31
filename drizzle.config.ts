import "dotenv/config";

import type { Config } from "drizzle-kit";

const databaseUrl =
  process.env.NODE_ENV === "test"
    ? (process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL)
    : process.env.DATABASE_URL;

export default {
  schema: "src/shared/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl!,
  },
} satisfies Config;
