export interface SearchMovieItemDto {
  externalId: string;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  releaseDate: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  originalLanguage: string | null;
  popularity: number | null;
  voteAverage: number | null;
}
