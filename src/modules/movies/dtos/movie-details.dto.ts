export interface MovieDetailsDto {
  externalId: string;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  releaseDate: string | null;
  runtime: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  genres: Array<{
    id: number;
    name: string;
  }>;
  originalLanguage: string | null;
  popularity: number | null;
  voteAverage: number | null;
  voteCount: number | null;
}
