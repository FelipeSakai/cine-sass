import { MovieDetailsDto } from "../../dtos/movie-details.dto";
import { SearchMovieItemDto } from "../../dtos/search-movie-item.dto";

export interface MovieProvider {
  searchMovies(query: string): Promise<SearchMovieItemDto[]>;
  getMovieDetails(externalId: string): Promise<MovieDetailsDto | null>;
}
