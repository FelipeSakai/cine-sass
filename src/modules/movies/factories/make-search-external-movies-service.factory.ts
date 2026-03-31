import { makeExternalMovieCatalogProvider } from "./make-external-movie-catalog-provider.factory";
import { SearchExternalMoviesService } from "../services/search-external-movies.service";

export function makeSearchExternalMoviesService() {
  return new SearchExternalMoviesService(makeExternalMovieCatalogProvider());
}
