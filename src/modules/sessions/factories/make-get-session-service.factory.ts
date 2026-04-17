import { DrizzleCatalogSessionsRepository } from "../repositories/drizzle/catalog-sessions.repository";
import { GetSessionService } from "../services/get-session.service";

export function makeGetSessionService() {
  return new GetSessionService(new DrizzleCatalogSessionsRepository());
}
