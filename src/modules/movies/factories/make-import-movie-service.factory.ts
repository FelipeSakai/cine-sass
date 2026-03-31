import { makeExternalMovieCatalogProvider } from "./make-external-movie-catalog-provider.factory";
import { DrizzleCatalogMoviesRepository } from "../repositories/drizzle/catalog-movies.repository";
import { ImportMovieService } from "../services/import-movie.service";

export function makeImportMovieService() {
  return new ImportMovieService(
    new DrizzleCatalogMoviesRepository(),
    makeExternalMovieCatalogProvider(),
  );
}
