import type {
  ExternalMovieSearchItem,
  SearchExternalMoviesInput,
  SearchExternalMoviesOutput,
} from "../../dtos/search-external-movies.dto";
import { MovieSourceProvider } from "../../domain/movie-source-provider";

export type ExternalMovieDetails = ExternalMovieSearchItem & {
  runtimeMinutes: number | null;
  importMetadata?: Record<string, unknown> | null;
};

export interface ExternalMovieCatalogProvider {
  readonly provider: MovieSourceProvider;
  searchMovies(
    input: SearchExternalMoviesInput,
  ): Promise<SearchExternalMoviesOutput>;
  getMovieDetails(sourceMovieId: string): Promise<ExternalMovieDetails | null>;
}
