import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeUnblockSessionSeatService } from "../../factories/make-unblock-session-seat-service.factory";

const paramsSchema = z.object({
  sessionId: z.uuid(),
  seatId: z.uuid(),
});

export async function unblockSessionSeatController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = paramsSchema.parse(request.params);

  const service = makeUnblockSessionSeatService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    sessionId: params.sessionId,
    seatId: params.seatId,
  });

  return reply.status(200).send(result);
}
