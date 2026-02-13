import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  makeAuthLoginService,
  makeAuthLogoutService,
} from "../../factories/auth.factory";

const bodySchema = z.object({
  refreshToken: z.string().min(10),
});

export async function authLogoutController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(req.body);

  const service = makeAuthLogoutService(req.server);
  const result = await service.execute(body);

  return reply.status(204).send(result);
}
