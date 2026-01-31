import type { FastifyInstance } from "fastify";
import { createTenantController } from "./controllers/create-tenant.controller";

export async function registerIamRoutes(app: FastifyInstance) {
  app.post("/tenants", createTenantController);
}
