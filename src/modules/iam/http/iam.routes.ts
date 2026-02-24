import type { FastifyInstance } from "fastify";
import { createTenantController } from "./controllers/create-tenant.controller";
import { requireAuth } from "./middlewares/requireAuth";
import { protectedPingController } from "./controllers/protectedPing.controller";
import { requireTenant } from "./middlewares/requireTenant";
import { tenantPingController } from "./controllers/tenantPing.controller";
import { requireRole } from "./middlewares/requireRole";
import { Role } from "../domain/role";
import { meController } from "./controllers/me.controller";

export async function registerIamRoutes(app: FastifyInstance) {
  app.get("/me", { preHandler: [requireAuth, requireTenant] }, meController);
  app.post("/tenants", createTenantController);
}
