import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeGetReservationService } from "../../factories/make-get-reservation-service.factory";

const paramsSchema = z.object({
  reservationId: z.uuid(),
});

export async function getReservationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = paramsSchema.parse(request.params);

  const service = makeGetReservationService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    reservationId: params.reservationId,
  });

  return reply.status(200).send(result);
}
