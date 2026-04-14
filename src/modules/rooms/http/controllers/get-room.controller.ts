import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeGetRoomService } from "../../factories/make-get-room-service.factory";

const paramsSchema = z.object({
  roomId: z.uuid(),
});

export async function getRoomController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = paramsSchema.parse(request.params);

  const service = makeGetRoomService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    roomId: params.roomId,
  });

  return reply.status(200).send(result);
}
