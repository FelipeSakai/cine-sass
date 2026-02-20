import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeGetMembershipService } from "../../factories/makeGetMembershipService.factory";

const tenantIdSchema = z.uuid();

export async function requireTenant(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const rawTenantId = request.headers["x-tenant-id"];

  if (!rawTenantId || typeof rawTenantId !== "string") {
    return reply.status(400).send({
      message: "x-tenant-id header is required",
    });
  }

  const parsed = tenantIdSchema.safeParse(rawTenantId);
  if (!parsed.success) {
    return reply.status(400).send({
      message: "x-tenant-id must be a valid uuid",
    });
  }

  const tenantId = parsed.data;

  const userId = request.user?.id;

  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const service = makeGetMembershipService();
  const membership = await service.execute({ tenantId, userId });

  if (!membership) {
    return reply.status(403).send({ message: "Forbidden" });
  }

  request.tenant = { id: tenantId };
  request.membership = membership;
}
