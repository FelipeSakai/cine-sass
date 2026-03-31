import { TmdbExternalMovieCatalogProvider } from "../integrations/providers/tmdb-external-movie-catalog.provider";

export function makeExternalMovieCatalogProvider() {
  return new TmdbExternalMovieCatalogProvider({
    apiKey: process.env.TMDB_API_KEY,
  });
}
