import { MovieSourceProvider } from "../domain/movie-source-provider";

export type SearchExternalMoviesInput = {
  tenantId: string;
  query: string;
  page?: number;
  provider?: MovieSourceProvider;
};

export type ExternalMovieSearchItem = {
  sourceProvider: MovieSourceProvider;
  sourceMovieId: string;
  title: string;
  originalTitle: string | null;
  synopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
};

export type SearchExternalMoviesOutput = {
  items: ExternalMovieSearchItem[];
  page: number;
  totalPages: number;
};
