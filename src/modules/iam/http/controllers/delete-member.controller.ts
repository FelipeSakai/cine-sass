import type { FastifyReply, FastifyRequest } from "fastify";
import { Role } from "../../domain/role";
import { deleteMemberParamsSchema } from "../../dtos/delete-member.dto";
import { makeDeleteMemberService } from "../../factories/make-delete-member-service.factory";

export async function deleteMemberController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsedParams = deleteMemberParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    return reply.status(400).send({
      message: "Validation error",
      issues: parsedParams.error.issues,
    });
  }

  const service = makeDeleteMemberService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    actorUserId: request.user!.id,
    actorRole: request.membership!.role as Role,
    targetUserId: parsedParams.data.userId,
  });

  if (!result.ok) {
    return reply.status(result.status).send({
      message: result.message,
    });
  }

  return reply.status(204).send();
}
