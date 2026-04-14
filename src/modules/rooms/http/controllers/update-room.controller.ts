import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { roomSeatLayoutSchema } from "../../domain/room-seat-layout";
import { makeUpdateRoomService } from "../../factories/make-update-room-service.factory";

const paramsSchema = z.object({
  roomId: z.uuid(),
});

const bodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    seatLayout: roomSeatLayoutSchema.optional(),
  })
  .refine((body) => body.name !== undefined || body.seatLayout !== undefined, {
    message: "At least one field must be provided",
  });

export async function updateRoomController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = paramsSchema.parse(request.params);
  const body = bodySchema.parse(request.body);

  const service = makeUpdateRoomService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    roomId: params.roomId,
    name: body.name,
    seatLayout: body.seatLayout,
  });

  return reply.status(200).send(result);
}
