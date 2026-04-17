import type { ListSessionsInput, ListSessionsOutputItem } from "../dtos/list-sessions.dto";
import type { CatalogSessionsRepository } from "../repositories/contracts";

export class ListSessionsService {
  constructor(private catalogSessionsRepo: CatalogSessionsRepository) {}

  async execute(input: ListSessionsInput): Promise<ListSessionsOutputItem[]> {
    return this.catalogSessionsRepo.findManyByTenantId(input.tenantId);
  }
}
