import type { DbExecutor } from "src/modules/iam/repositories/contracts";

import type {
  MaterializeSessionSeatsInput,
  MaterializeSessionSeatsOutput,
} from "../dtos/materialize-session-seats.dto";
import type { CatalogSessionSeatsRepository } from "../repositories/contracts";

export class MaterializeSessionSeatsService {
  constructor(private catalogSessionSeatsRepo: CatalogSessionSeatsRepository) {}

  async execute(
    input: MaterializeSessionSeatsInput,
    executor?: DbExecutor,
  ): Promise<MaterializeSessionSeatsOutput[]> {
    const seatsToCreate = input.roomLayoutSnapshot.rows.flatMap((row) =>
      row.seats
        .filter((seat) => seat.active)
        .map((seat) => ({
          tenantId: input.tenantId,
          sessionId: input.sessionId,
          seatKey: `${row.label}-${seat.number}`,
          rowLabel: row.label,
          seatNumber: seat.number,
          seatType: seat.type,
          isAccessibilitySeat: false,
        })),
    );

    return this.catalogSessionSeatsRepo.createMany(seatsToCreate, executor);
  }
}
