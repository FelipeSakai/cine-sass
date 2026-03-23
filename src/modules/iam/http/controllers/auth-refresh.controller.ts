import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAuthRefreshService } from "../../factories/make-auth-refresh-service.factory";
const bodySchema = z.object({
  refreshToken: z.string().min(10),
});

export async function authRefreshController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(req.body);

  const service = makeAuthRefreshService(req.server);
  const result = await service.execute(body);

  return reply.status(200).send(result);
}
