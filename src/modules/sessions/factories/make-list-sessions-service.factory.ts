import { DrizzleCatalogSessionsRepository } from "../repositories/drizzle/catalog-sessions.repository";
import { ListSessionsService } from "../services/list-sessions.service";

export function makeListSessionsService() {
  return new ListSessionsService(new DrizzleCatalogSessionsRepository());
}
