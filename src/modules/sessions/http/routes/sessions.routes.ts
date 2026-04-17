import type { FastifyInstance } from "fastify";

import { Role } from "src/modules/iam/domain/role";
import { requireAuth } from "src/modules/iam/http/middlewares/require-auth";
import { requireRole } from "src/modules/iam/http/middlewares/require-role";
import { requireTenant } from "src/modules/iam/http/middlewares/require-tenant";

import { createSessionController } from "../controllers/create-session.controller";
import { getSessionController } from "../controllers/get-session.controller";
import { listSessionsController } from "../controllers/list-sessions.controller";

const sessionWriteHandlers = [
  requireAuth,
  requireTenant,
  requireRole([Role.OWNER, Role.ADMIN, Role.STAFF]),
];

export async function registerSessionsRoutes(app: FastifyInstance) {
  app.post("/sessions", { preHandler: sessionWriteHandlers }, createSessionController);
  app.get(
    "/sessions",
    { preHandler: [requireAuth, requireTenant] },
    listSessionsController,
  );
  app.get(
    "/sessions/:sessionId",
    { preHandler: [requireAuth, requireTenant] },
    getSessionController,
  );
}
