import type { FastifyInstance } from "fastify";

import { Role } from "src/modules/iam/domain/role";
import { requireAuth } from "src/modules/iam/http/middlewares/require-auth";
import { requireRole } from "src/modules/iam/http/middlewares/require-role";
import { requireTenant } from "src/modules/iam/http/middlewares/require-tenant";

import { blockSessionSeatController } from "../controllers/block-session-seat.controller";
import { listSessionSeatsController } from "../controllers/list-session-seats.controller";
import { unblockSessionSeatController } from "../controllers/unblock-session-seat.controller";

const sessionSeatWriteHandlers = [
  requireAuth,
  requireTenant,
  requireRole([Role.OWNER, Role.ADMIN, Role.STAFF]),
];

export async function registerSessionSeatsRoutes(app: FastifyInstance) {
  app.get(
    "/sessions/:sessionId/seats",
    { preHandler: [requireAuth, requireTenant] },
    listSessionSeatsController,
  );
  app.patch(
    "/sessions/:sessionId/seats/:seatId/block",
    { preHandler: sessionSeatWriteHandlers },
    blockSessionSeatController,
  );
  app.patch(
    "/sessions/:sessionId/seats/:seatId/unblock",
    { preHandler: sessionSeatWriteHandlers },
    unblockSessionSeatController,
  );
}
