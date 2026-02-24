import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetMeService } from "../../factories/makeGetMeService.factory";

export async function meController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const service = makeGetMeService();
  const user = await service.execute(request.user!.id);

  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  return reply.status(200).send({
    userId: user.id,
    email: user.email,
    tenantId: request.tenant!.id,
    role: request.membership!.role,
  });
}
