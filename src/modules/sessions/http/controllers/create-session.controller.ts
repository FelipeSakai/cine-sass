import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeCreateSessionService } from "../../factories/make-create-session-service.factory";

const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value));

const bodySchema = z.object({
  movieId: z.uuid(),
  roomId: z.uuid(),
  startsAt: isoDateTimeSchema,
  endsAt: isoDateTimeSchema,
});

export async function createSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(request.body);

  const service = makeCreateSessionService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    movieId: body.movieId,
    roomId: body.roomId,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
  });

  return reply.status(201).send(result);
}
