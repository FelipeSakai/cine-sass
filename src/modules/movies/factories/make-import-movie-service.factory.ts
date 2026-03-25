import type { ExternalMovieCatalogProvider } from "../integrations/providers/external-movie-catalog.provider";
import type { CatalogMoviesRepository } from "../repositories/contracts";
import { ImportMovieService } from "../services/import-movie.service";

export function makeImportMovieService(
  catalogMoviesRepo: CatalogMoviesRepository,
  externalCatalogProvider: ExternalMovieCatalogProvider,
) {
  return new ImportMovieService(catalogMoviesRepo, externalCatalogProvider);
}
