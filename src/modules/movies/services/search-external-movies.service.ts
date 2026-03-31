import { ApiError } from "src/shared/errors/api-error";

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
    if (input.provider && input.provider !== this.externalCatalogProvider.provider) {
      throw new ApiError("Unsupported movie provider", 400);
    }

    return this.externalCatalogProvider.searchMovies(input);
  }
}
