import type {
  SearchExternalMoviesInput,
  SearchExternalMoviesOutput,
} from "../dtos/search-external-movies.dto";
import type { ExternalMovieCatalogProvider } from "../integrations/providers/external-movie-catalog.provider";

export class SearchExternalMoviesService {
  constructor(private externalCatalogProvider: ExternalMovieCatalogProvider) {}

  async execute(
    input: SearchExternalMoviesInput,
  ): Promise<SearchExternalMoviesOutput> {
    return this.externalCatalogProvider.searchMovies(input);
  }
}
