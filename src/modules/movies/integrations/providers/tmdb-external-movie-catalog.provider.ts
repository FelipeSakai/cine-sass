import { ApiError } from "src/shared/errors/api-error";

import type {
  SearchExternalMoviesInput,
  SearchExternalMoviesOutput,
} from "../../dtos/search-external-movies.dto";
import type {
  ExternalMovieCatalogProvider,
  ExternalMovieDetails,
} from "./external-movie-catalog.provider";

type TmdbSearchResponse = {
  page: number;
  total_pages: number;
  results: TmdbMovieSummary[];
};

type TmdbMovieSummary = {
  id: number;
  title: string;
  original_title: string | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
};

type TmdbMovieDetailsResponse = TmdbMovieSummary & {
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  original_language: string | null;
  popularity: number | null;
  vote_average: number | null;
  vote_count: number | null;
};

type TmdbExternalMovieCatalogProviderOptions = {
  apiKey?: string;
  baseUrl?: string;
};

export class TmdbExternalMovieCatalogProvider
  implements ExternalMovieCatalogProvider
{
  readonly provider = "TMDB" as const;

  private readonly apiKey?: string;
  private readonly baseUrl: string;

  constructor(options: TmdbExternalMovieCatalogProviderOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://api.themoviedb.org/3";
  }

  async searchMovies(
    input: SearchExternalMoviesInput,
  ): Promise<SearchExternalMoviesOutput> {
    const response = await this.request<TmdbSearchResponse>("/search/movie", {
      query: input.query,
      page: String(input.page ?? 1),
      include_adult: "false",
    });

    if (!response) {
      throw new ApiError("TMDB provider request failed", 502);
    }

    return {
      items: response.results.map((movie) => this.mapSearchItem(movie)),
      page: response.page,
      totalPages: response.total_pages,
    };
  }

  async getMovieDetails(sourceMovieId: string): Promise<ExternalMovieDetails | null> {
    const response = await this.request<TmdbMovieDetailsResponse>(
      `/movie/${sourceMovieId}`,
      {},
      { allowNotFound: true },
    );

    if (!response) {
      return null;
    }

    return {
      ...this.mapSearchItem(response),
      runtimeMinutes: response.runtime,
      importMetadata: {
        genres: response.genres,
        originalLanguage: response.original_language,
        popularity: response.popularity,
        voteAverage: response.vote_average,
        voteCount: response.vote_count,
      },
    };
  }

  private async request<T>(
    path: string,
    params: Record<string, string>,
    options: { allowNotFound?: boolean } = {},
  ): Promise<T | null> {
    if (!this.apiKey) {
      throw new ApiError("TMDB API key is not configured", 503);
    }

    const url = new URL(`${this.baseUrl}${path}`);

    url.searchParams.set("api_key", this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url);

    if (options.allowNotFound && response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ApiError("TMDB provider request failed", 502);
    }

    return (await response.json()) as T;
  }

  private mapSearchItem(movie: TmdbMovieSummary) {
    return {
      sourceProvider: this.provider,
      sourceMovieId: String(movie.id),
      title: movie.title,
      originalTitle: movie.original_title,
      synopsis: movie.overview,
      posterUrl: this.mapImageUrl(movie.poster_path, "w500"),
      backdropUrl: this.mapImageUrl(movie.backdrop_path, "w1280"),
      releaseDate: movie.release_date || null,
    };
  }

  private mapImageUrl(path: string | null, size: string) {
    if (!path) {
      return null;
    }

    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}
