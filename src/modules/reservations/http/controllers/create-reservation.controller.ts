import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeCreateReservationService } from "../../factories/make-create-reservation-service.factory";

const paramsSchema = z.object({
  sessionId: z.uuid(),
});

const bodySchema = z.object({
  seatIds: z.array(z.uuid()).min(1),
});

export async function createReservationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = paramsSchema.parse(request.params);
  const body = bodySchema.parse(request.body);

  const service = makeCreateReservationService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    sessionId: params.sessionId,
    actorUserId: request.user!.id,
    seatIds: body.seatIds,
  });

  return reply.status(201).send(result);
}
