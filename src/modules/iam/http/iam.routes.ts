import type { FastifyInstance } from "fastify";
import { createTenantController } from "./controllers/create-tenant.controller";

import { updateMemberRoleController } from "./controllers/update-member-role.controller";
import { requireAuth } from "./middlewares/require-auth";
import { requireTenant } from "./middlewares/require-tenant";
import { meController } from "./controllers/me.controller";
import { protectedPingController } from "./controllers/protected-ping.controller";
import { tenantPingController } from "./controllers/tenant-ping.controller";
import { Role } from "../domain/role";
import { requireRole } from "./middlewares/require-role";
import { adminPingController } from "./controllers/admin-ping.controller";
import { createMemberController } from "./controllers/create-member.controller";
import { getMembersController } from "./controllers/get-members.controller";

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
  app.patch(
    "/members/:userId/role",
    {
      preHandler: [
        requireAuth,
        requireTenant,
        requireRole([Role.OWNER, Role.ADMIN]),
      ],
    },
    updateMemberRoleController,
  );
}
