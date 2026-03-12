import type { FastifyInstance } from "fastify";
import { createTenantController } from "./controllers/createTenant.controller";
import { requireAuth } from "./middlewares/requireAuth";
import { protectedPingController } from "./controllers/protectedPing.controller";
import { requireTenant } from "./middlewares/requireTenant";
import { tenantPingController } from "./controllers/tenantPing.controller";
import { requireRole } from "./middlewares/requireRole";
import { Role } from "../domain/role";
import { meController } from "./controllers/me.controller";
import { createMemberController } from "./controllers/createMember.controller";
import { adminPingController } from "./controllers/adminPing.controller";
import { getMembersController } from "./controllers/getMembers.controller";

export async function registerIamRoutes(app: FastifyInstance) {
  app.get("/me", { preHandler: [requireAuth, requireTenant] }, meController);
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
  app.get(
    "/protected/admin-ping",
    {
      preHandler: [
        requireAuth,
        requireTenant,
        requireRole([Role.OWNER, Role.ADMIN]),
      ],
    },
    adminPingController,
  );
  app.post(
    "/members",
    {
      preHandler: [
        requireAuth,
        requireTenant,
        requireRole([Role.OWNER, Role.ADMIN]),
      ],
    },
    createMemberController,
  );
  app.get(
    "/members",
    {
      preHandler: [
        requireAuth,
        requireTenant,
        requireRole([Role.OWNER, Role.ADMIN]),
      ],
    },
    getMembersController,
  );
  app.post("/tenants", createTenantController);
}
