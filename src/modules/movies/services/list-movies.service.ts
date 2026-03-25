import type {
  ListMoviesInput,
  ListMoviesOutputItem,
} from "../dtos/list-movies.dto";
import type { CatalogMoviesRepository } from "../repositories/contracts";

export class ListMoviesService {
  constructor(private catalogMoviesRepo: CatalogMoviesRepository) {}

  async execute(input: ListMoviesInput): Promise<ListMoviesOutputItem[]> {
    const movies = await this.catalogMoviesRepo.findManyByTenantId(input.tenantId);

    return movies.map((movie) => ({
      id: movie.id,
      tenantId: movie.tenantId,
      title: movie.title,
      originalTitle: movie.originalTitle,
      synopsis: movie.synopsis,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      releaseDate: movie.releaseDate,
      sourceProvider: movie.sourceProvider,
      sourceMovieId: movie.sourceMovieId,
      importedAt: movie.importedAt,
    }));
  }
}
