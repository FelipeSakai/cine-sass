import type { FastifyReply, FastifyRequest } from "fastify";

import { makeListRoomsService } from "../../factories/make-list-rooms-service.factory";

export async function listRoomsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const service = makeListRoomsService();
  const result = await service.execute({ tenantId: request.tenant!.id });

  return reply.status(200).send(result);
}
