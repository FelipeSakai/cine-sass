import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { roomSeatLayoutSchema } from "../../domain/room-seat-layout";
import { makeCreateRoomService } from "../../factories/make-create-room-service.factory";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  seatLayout: roomSeatLayoutSchema,
});

export async function createRoomController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(request.body);

  const service = makeCreateRoomService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    name: body.name,
    seatLayout: body.seatLayout,
  });

  return reply.status(201).send(result);
}
