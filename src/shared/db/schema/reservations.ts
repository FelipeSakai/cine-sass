import { index, pgEnum, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users, tenants } from "./iam";
import { catalog } from "./movies";
import { catalogSessionSeats } from "./session-seats";
import { catalogSessions } from "./sessions";

export const reservationStatus = pgEnum("reservation_status", [
  "HOLD",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
]);

export const catalogReservations = catalog.table(
  "reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => catalogSessions.id, { onDelete: "cascade" }),
    status: reservationStatus("status").default("HOLD").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("catalog_reservations_tenant_id_idx").on(t.tenantId),
    index("catalog_reservations_session_id_idx").on(t.sessionId),
    index("catalog_reservations_created_by_user_id_idx").on(t.createdByUserId),
    index("catalog_reservations_tenant_status_idx").on(t.tenantId, t.status),
    index("catalog_reservations_tenant_session_status_idx").on(t.tenantId, t.sessionId, t.status),
    index("catalog_reservations_expires_at_idx").on(t.expiresAt),
  ],
);

export const catalogReservationSeats = catalog.table(
  "reservation_seats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => catalogReservations.id, { onDelete: "cascade" }),
    sessionSeatId: uuid("session_seat_id")
      .notNull()
      .references(() => catalogSessionSeats.id, { onDelete: "restrict" }),
    seatKey: text("seat_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("catalog_reservation_seats_reservation_seat_uq").on(
      t.reservationId,
      t.sessionSeatId,
    ),
    index("catalog_reservation_seats_tenant_id_idx").on(t.tenantId),
    index("catalog_reservation_seats_reservation_id_idx").on(t.reservationId),
    index("catalog_reservation_seats_session_seat_id_idx").on(t.sessionSeatId),
  ],
);
