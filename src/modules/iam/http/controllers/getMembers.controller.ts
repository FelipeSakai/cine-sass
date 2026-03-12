import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetMembersService } from "../../factories/makeGetMembersService";

export async function getMembersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const tenantId = request.tenant!.id;

  const service = makeGetMembersService();

  const members = await service.execute(tenantId);
  return reply.status(200).send(members);
}
