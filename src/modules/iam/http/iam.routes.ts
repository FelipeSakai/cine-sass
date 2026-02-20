import type { FastifyInstance } from "fastify";
import { createTenantController } from "./controllers/create-tenant.controller";
import { requireAuth } from "./middlewares/requireAuth";
import { protectedPingController } from "./controllers/protectedPing.controller";
import { requireTenant } from "./middlewares/requireTenant";
import { tenantPingController } from "./controllers/tenantPing.controller";

export async function registerIamRoutes(app: FastifyInstance) {
  app.get(
    "/protected/ping",
    { preHandler: [requireAuth] },
    protectedPingController,
  );

  app.get(
    "/protected/tenant-ping",
    { preHandler: [requireAuth, requireTenant] },
    tenantPingController,
  );

  app.post("/tenants", createTenantController);
}
