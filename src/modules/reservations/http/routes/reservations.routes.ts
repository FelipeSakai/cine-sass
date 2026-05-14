import type { FastifyInstance } from "fastify";

import { Role } from "src/modules/iam/domain/role";
import { requireAuth } from "src/modules/iam/http/middlewares/require-auth";
import { requireRole } from "src/modules/iam/http/middlewares/require-role";
import { requireTenant } from "src/modules/iam/http/middlewares/require-tenant";

import { cancelReservationController } from "../controllers/cancel-reservation.controller";
import { confirmReservationController } from "../controllers/confirm-reservation.controller";
import { createReservationController } from "../controllers/create-reservation.controller";
import { getReservationController } from "../controllers/get-reservation.controller";

const reservationWriteHandlers = [
  requireAuth,
  requireTenant,
  requireRole([Role.OWNER, Role.ADMIN, Role.STAFF]),
];

export async function registerReservationsRoutes(app: FastifyInstance) {
  app.get(
    "/reservations/:reservationId",
    { preHandler: [requireAuth, requireTenant] },
    getReservationController,
  );
  app.post(
    "/sessions/:sessionId/reservations",
    { preHandler: reservationWriteHandlers },
    createReservationController,
  );
  app.post(
    "/reservations/:reservationId/confirm",
    { preHandler: reservationWriteHandlers },
    confirmReservationController,
  );
  app.post(
    "/reservations/:reservationId/cancel",
    { preHandler: reservationWriteHandlers },
    cancelReservationController,
  );
}
