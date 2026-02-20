import { FastifyReply, FastifyRequest } from "fastify";

export async function protectedPingController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(200).send({
    ok: true,
    userId: request.user?.id,
  });
}
