import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeCancelReservationService } from "../../factories/make-cancel-reservation-service.factory";

const paramsSchema = z.object({
  reservationId: z.uuid(),
});

export async function cancelReservationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = paramsSchema.parse(request.params);

  const service = makeCancelReservationService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    reservationId: params.reservationId,
  });

  return reply.status(200).send(result);
}
