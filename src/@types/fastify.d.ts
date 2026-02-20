import fastify from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    tenant?: {
      id: string;
    };
    membership?: {
      id: string;
      tenantId: string;
      userId: string;
      role: "OWNER" | "ADMIN" | "STAFF" | "VIEWER";
    };
  }
}
