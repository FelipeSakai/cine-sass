import { and, desc, eq } from "drizzle-orm";

import { db } from "src/shared/db/client";
import { catalogMovies } from "src/shared/db/schema";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";

import type {
  CatalogMovieInsert,
  CatalogMovieRecord,
  CatalogMoviesRepository,
} from "../contracts";

export class DrizzleCatalogMoviesRepository implements CatalogMoviesRepository {
  async create(
    data: Omit<CatalogMovieInsert, "id" | "createdAt" | "updatedAt" | "importedAt">,
    executor: DbExecutor = db,
  ): Promise<{ id: string }> {
    const [created] = await executor
      .insert(catalogMovies)
      .values(data)
      .returning({ id: catalogMovies.id });

    return created;
  }

  async findByIdAndTenantId(
    movieId: string,
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogMovieRecord | null> {
    const [movie] = await executor
      .select()
      .from(catalogMovies)
      .where(and(eq(catalogMovies.id, movieId), eq(catalogMovies.tenantId, tenantId)))
      .limit(1);

    return movie ?? null;
  }

  async findByTenantAndSourceRef(
    tenantId: string,
    sourceProvider: CatalogMovieRecord["sourceProvider"],
    sourceMovieId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogMovieRecord | null> {
    const [movie] = await executor
      .select()
      .from(catalogMovies)
      .where(
        and(
          eq(catalogMovies.tenantId, tenantId),
          eq(catalogMovies.sourceProvider, sourceProvider),
          eq(catalogMovies.sourceMovieId, sourceMovieId),
        ),
      )
      .limit(1);

    return movie ?? null;
  }

  async findManyByTenantId(
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogMovieRecord[]> {
    return executor
      .select()
      .from(catalogMovies)
      .where(eq(catalogMovies.tenantId, tenantId))
      .orderBy(desc(catalogMovies.importedAt), desc(catalogMovies.createdAt));
  }
}
