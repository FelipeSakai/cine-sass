import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Role } from "../../domain/role";
import { makeCreateMemberService } from "../../factories/make-create-member-service.factory";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
});

export async function createMemberController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(request.body);

  const service = makeCreateMemberService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    actorRole: request.membership!.role,
    email: body.email,
    password: body.password,
    role: body.role,
  });

  if (!result.ok) {
    return reply.status(result.status).send({ message: result.message });
  }

  return reply.status(201).send({
    userId: result.userId,
    membershipId: result.membershipId,
    role: result.role,
  });
}
