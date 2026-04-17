import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { catalogMovies } from "src/shared/db/schema/movies";
import type { DbExecutor } from "src/modules/iam/repositories/contracts";

export type CatalogMovieInsert = InferInsertModel<typeof catalogMovies>;
export type CatalogMovieRecord = InferSelectModel<typeof catalogMovies>;

export interface CatalogMoviesRepository {
  create(
    data: Omit<CatalogMovieInsert, "id" | "createdAt" | "updatedAt" | "importedAt">,
    executor?: DbExecutor,
  ): Promise<{ id: string }>;
  findByIdAndTenantId(
    movieId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogMovieRecord | null>;
  findByTenantAndSourceRef(
    tenantId: string,
    sourceProvider: CatalogMovieRecord["sourceProvider"],
    sourceMovieId: string,
    executor?: DbExecutor,
  ): Promise<CatalogMovieRecord | null>;
  findManyByTenantId(
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogMovieRecord[]>;
}
