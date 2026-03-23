import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateTenantOwnerService } from "../../factories/make-create-tenant-owner-service.factory";

const bodySchema = z.object({
  tenantName: z.string().min(2),
  tenantSlug: z
    .string()
    .min(2)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    ),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6),
});

export async function createTenantController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(req.body);

  const service = makeCreateTenantOwnerService();
  const result = await service.execute(body);

  return reply.status(201).send({
    tenantId: result.tenantId,
    userId: result.userId,
    membershipId: result.membershipId,
  });
}
