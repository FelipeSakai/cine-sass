import { DrizzleCatalogMoviesRepository } from "../repositories/drizzle/catalog-movies.repository";
import { ListMoviesService } from "../services/list-movies.service";

export function makeListMoviesService() {
  return new ListMoviesService(new DrizzleCatalogMoviesRepository());
}
