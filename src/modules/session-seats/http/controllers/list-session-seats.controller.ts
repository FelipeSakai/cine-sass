import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeListSessionSeatsService } from "../../factories/make-list-session-seats-service.factory";

const paramsSchema = z.object({
  sessionId: z.uuid(),
});

export async function listSessionSeatsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = paramsSchema.parse(request.params);

  const service = makeListSessionSeatsService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    sessionId: params.sessionId,
  });

  return reply.status(200).send(result);
}
