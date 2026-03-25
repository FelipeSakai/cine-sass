import { MovieSourceProvider } from "../domain/movie-source-provider";

export type ImportMovieInput = {
  tenantId: string;
  sourceProvider: MovieSourceProvider;
  sourceMovieId: string;
};

export type ImportMovieOutput = {
  movieId: string;
  imported: boolean;
};
