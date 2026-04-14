import type { ListRoomsInput, ListRoomsOutputItem } from "../dtos/list-rooms.dto";
import type { CatalogRoomsRepository } from "../repositories/contracts";

export class ListRoomsService {
  constructor(private catalogRoomsRepo: CatalogRoomsRepository) {}

  async execute(input: ListRoomsInput): Promise<ListRoomsOutputItem[]> {
    return this.catalogRoomsRepo.findManyByTenantId(input.tenantId);
  }
}
