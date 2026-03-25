import type { CatalogMoviesRepository } from "../repositories/contracts";
import { ListMoviesService } from "../services/list-movies.service";

export function makeListMoviesService(catalogMoviesRepo: CatalogMoviesRepository) {
  return new ListMoviesService(catalogMoviesRepo);
}
