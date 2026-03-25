import {
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { tenants } from "./iam";

export const catalog = pgSchema("catalog");

export const movieSourceProvider = pgEnum("movie_source_provider", ["TMDB"]);

export const catalogMovies = catalog.table(
  "movies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    originalTitle: text("original_title"),
    synopsis: text("synopsis"),
    posterUrl: text("poster_url"),
    backdropUrl: text("backdrop_url"),
    releaseDate: date("release_date"),
    runtimeMinutes: integer("runtime_minutes"),
    sourceProvider: movieSourceProvider("source_provider").notNull(),
    sourceMovieId: text("source_movie_id").notNull(),
    importMetadata: jsonb("import_metadata").$type<Record<string, unknown> | null>(),
    importedAt: timestamp("imported_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("catalog_movies_tenant_id_idx").on(t.tenantId),
    uniqueIndex("catalog_movies_tenant_source_movie_uq").on(
      t.tenantId,
      t.sourceProvider,
      t.sourceMovieId,
    ),
  ],
);
