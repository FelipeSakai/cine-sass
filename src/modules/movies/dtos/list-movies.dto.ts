import { MovieSourceProvider } from "../domain/movie-source-provider";

export type ListMoviesInput = {
  tenantId: string;
};

export type ListMoviesOutputItem = {
  id: string;
  tenantId: string;
  title: string;
  originalTitle: string | null;
  synopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  sourceProvider: MovieSourceProvider;
  sourceMovieId: string;
  importedAt: Date;
};
