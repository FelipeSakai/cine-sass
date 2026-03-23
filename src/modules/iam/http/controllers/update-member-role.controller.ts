import type { FastifyReply, FastifyRequest } from "fastify";
import {
  updateMemberRoleBodySchema,
  updateMemberRoleParamsSchema,
} from "../../dtos/update-member-role.dto";
import { makeUpdateMemberRoleService } from "../../factories/make-update-member-role-service.factory";
import { Role } from "../../domain/role";

export async function updateMemberRoleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsedParams = updateMemberRoleParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return reply.status(400).send({
      message: "Validation error",
      issues: parsedParams.error.issues,
    });
  }

  const parsedBody = updateMemberRoleBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    return reply.status(400).send({
      message: "Validation error",
      issues: parsedBody.error.issues,
    });
  }

  const service = makeUpdateMemberRoleService();

  const result = await service.execute({
    tenantId: request.tenant!.id,
    actorUserId: request.user!.id,
    actorRole: request.membership!.role as Role,
    targetUserId: parsedParams.data.userId,
    newRole: parsedBody.data.role,
  });

  if (!result.ok) {
    return reply.status(result.status).send({
      message: result.message,
    });
  }

  return reply.status(204).send();
}
