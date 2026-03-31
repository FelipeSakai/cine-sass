import type { FastifyReply, FastifyRequest } from "fastify";

import { makeListMoviesService } from "../../factories/make-list-movies-service.factory";

export async function listMoviesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const service = makeListMoviesService();
  const result = await service.execute({ tenantId: request.tenant!.id });

  return reply.status(200).send(result);
}
