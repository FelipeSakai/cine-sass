import type { FastifyInstance } from "fastify";

import { Role } from "src/modules/iam/domain/role";
import { requireAuth } from "src/modules/iam/http/middlewares/require-auth";
import { requireRole } from "src/modules/iam/http/middlewares/require-role";
import { requireTenant } from "src/modules/iam/http/middlewares/require-tenant";

import { createRoomController } from "../controllers/create-room.controller";
import { getRoomController } from "../controllers/get-room.controller";
import { listRoomsController } from "../controllers/list-rooms.controller";
import { updateRoomController } from "../controllers/update-room.controller";

const roomWriteHandlers = [
  requireAuth,
  requireTenant,
  requireRole([Role.OWNER, Role.ADMIN, Role.STAFF]),
];

export async function registerRoomsRoutes(app: FastifyInstance) {
  app.post("/rooms", { preHandler: roomWriteHandlers }, createRoomController);
  app.get(
    "/rooms",
    { preHandler: [requireAuth, requireTenant] },
    listRoomsController,
  );
  app.get(
    "/rooms/:roomId",
    { preHandler: [requireAuth, requireTenant] },
    getRoomController,
  );
  app.patch(
    "/rooms/:roomId",
    { preHandler: roomWriteHandlers },
    updateRoomController,
  );
}
