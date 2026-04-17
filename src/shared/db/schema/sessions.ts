import { index, jsonb, pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";

import { tenants } from "./iam";
import { catalog, catalogMovies } from "./movies";
import { catalogRooms, type CatalogRoomSeatLayout } from "./rooms";

export const sessionStatus = pgEnum("session_status", ["SCHEDULED", "CANCELLED"]);

export const catalogSessions = catalog.table(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => catalogMovies.id, { onDelete: "restrict" }),
    roomId: uuid("room_id")
      .notNull()
      .references(() => catalogRooms.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: sessionStatus("status").default("SCHEDULED").notNull(),
    roomLayoutSnapshot: jsonb("room_layout_snapshot")
      .$type<CatalogRoomSeatLayout>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("catalog_sessions_tenant_id_idx").on(t.tenantId),
    index("catalog_sessions_room_id_idx").on(t.roomId),
    index("catalog_sessions_tenant_room_starts_at_idx").on(
      t.tenantId,
      t.roomId,
      t.startsAt,
    ),
    index("catalog_sessions_tenant_starts_at_idx").on(t.tenantId, t.startsAt),
  ],
);
