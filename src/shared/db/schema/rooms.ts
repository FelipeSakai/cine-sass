import { index, integer, jsonb, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { tenants } from "./iam";
import { catalog } from "./movies";

type CatalogRoomSeat = {
  number: number;
  type: "STANDARD";
  active: boolean;
};

type CatalogRoomSeatRow = {
  label: string;
  seats: CatalogRoomSeat[];
};

export type CatalogRoomSeatLayout = {
  rows: CatalogRoomSeatRow[];
};

export const catalogRooms = catalog.table(
  "rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    seatLayout: jsonb("seat_layout").$type<CatalogRoomSeatLayout>().notNull(),
    seatCount: integer("seat_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("catalog_rooms_tenant_id_idx").on(t.tenantId),
    uniqueIndex("catalog_rooms_tenant_name_uq").on(t.tenantId, t.name),
  ],
);
