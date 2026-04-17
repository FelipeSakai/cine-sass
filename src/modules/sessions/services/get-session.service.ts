import { ApiError } from "src/shared/errors/api-error";

import type { GetSessionInput, GetSessionOutput } from "../dtos/get-session.dto";
import type { CatalogSessionsRepository } from "../repositories/contracts";

export class GetSessionService {
  constructor(private catalogSessionsRepo: CatalogSessionsRepository) {}

  async execute(input: GetSessionInput): Promise<GetSessionOutput> {
    const session = await this.catalogSessionsRepo.findByIdAndTenantId(
      input.sessionId,
      input.tenantId,
    );

    if (!session) {
      throw new ApiError("Session not found", 404);
    }

    return session;
  }
}
