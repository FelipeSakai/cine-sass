import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tbSystemInfo = pgTable("tb_system_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
