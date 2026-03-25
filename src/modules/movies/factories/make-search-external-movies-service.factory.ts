import type { ExternalMovieCatalogProvider } from "../integrations/providers/external-movie-catalog.provider";
import { SearchExternalMoviesService } from "../services/search-external-movies.service";

export function makeSearchExternalMoviesService(
  externalCatalogProvider: ExternalMovieCatalogProvider,
) {
  return new SearchExternalMoviesService(externalCatalogProvider);
}
