import type { RoomSeatLayout } from "src/modules/rooms/domain/room-seat-layout";

import type { SessionStatus } from "../domain/session-status";

export type GetSessionInput = {
  tenantId: string;
  sessionId: string;
};

export type GetSessionOutput = {
  id: string;
  tenantId: string;
  movieId: string;
  roomId: string;
  startsAt: Date;
  endsAt: Date;
  status: SessionStatus;
  roomLayoutSnapshot: RoomSeatLayout;
  createdAt: Date;
  updatedAt: Date;
};
