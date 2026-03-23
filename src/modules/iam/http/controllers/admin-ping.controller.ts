import { FastifyReply, FastifyRequest } from "fastify";

export async function adminPingController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(200).send({
    ok: true,
    userId: request.user?.id,
    tenantId: request.tenant?.id,
    role: request.membership?.role,
  });
}
