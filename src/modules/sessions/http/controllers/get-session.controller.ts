import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeGetSessionService } from "../../factories/make-get-session-service.factory";

const paramsSchema = z.object({
  sessionId: z.uuid(),
});

export async function getSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = paramsSchema.parse(request.params);

  const service = makeGetSessionService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    sessionId: params.sessionId,
  });

  return reply.status(200).send(result);
}
