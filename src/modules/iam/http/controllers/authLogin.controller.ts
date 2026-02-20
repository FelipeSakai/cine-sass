import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAuthLoginService } from "../../factories/makeAuthLoginService.factory";

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function authLoginController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(req.body);

  const service = makeAuthLoginService(req.server);
  const result = await service.execute(body);

  return reply.status(200).send(result);
}
