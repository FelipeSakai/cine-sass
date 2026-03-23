import { FastifyReply, FastifyRequest } from "fastify";
import { Role } from "../../domain/role";

export function requireRole(allowedRoles: Role[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const role = request.membership?.role;

    if (!role || !allowedRoles.includes(role)) {
      return reply.status(403).send({ message: "Forbidden" });
    }
  };
}
