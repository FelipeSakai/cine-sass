import type { FastifyReply, FastifyRequest } from "fastify";

import { makeListSessionsService } from "../../factories/make-list-sessions-service.factory";

export async function listSessionsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const service = makeListSessionsService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
  });

  return reply.status(200).send(result);
}
