import { FastifyReply, FastifyRequest } from "fastify";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const payload = await request.jwtVerify<{ sub: string }>();
    request.user = { id: payload.sub };
  } catch {
    return reply.status(401).send({
      message: "Unauthorized",
    });
  }
}
