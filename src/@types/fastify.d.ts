import fastify from "fastify";
import { Role } from "src/modules/iam/domain/role";

declare module "fastify" {
  interface FastifyRequest {
    tenant?: {
      id: string;
    };
    membership?: {
      id: string;
      tenantId: string;
      userId: string;
      role: Role;
    };
  }
}
