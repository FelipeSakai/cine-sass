import {
  boolean,
  index,
  integer,
  pgEnum,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { RoomSeatType } from "src/modules/rooms/domain/room-seat-type";

import { tenants } from "./iam";
import { catalog } from "./movies";
import { catalogSessions } from "./sessions";

export const sessionSeatStatus = pgEnum("session_seat_status", [
  "AVAILABLE",
  "BLOCKED",
  "RESERVED",
]);

export const catalogSessionSeats = catalog.table(
  "session_seats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => catalogSessions.id, { onDelete: "cascade" }),
    seatKey: text("seat_key").notNull(),
    rowLabel: text("row_label").notNull(),
    seatNumber: integer("seat_number").notNull(),
    seatType: text("seat_type").$type<RoomSeatType>().notNull(),
    status: sessionSeatStatus("status").default("AVAILABLE").notNull(),
    isAccessibilitySeat: boolean("is_accessibility_seat").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("catalog_session_seats_session_seat_key_uq").on(t.sessionId, t.seatKey),
    index("catalog_session_seats_tenant_id_idx").on(t.tenantId),
    index("catalog_session_seats_session_id_idx").on(t.sessionId),
    index("catalog_session_seats_tenant_session_idx").on(t.tenantId, t.sessionId),
    index("catalog_session_seats_session_status_idx").on(t.sessionId, t.status),
  ],
);
