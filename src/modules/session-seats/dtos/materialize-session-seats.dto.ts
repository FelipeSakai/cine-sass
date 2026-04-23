import type { RoomSeatLayout } from "src/modules/rooms/domain/room-seat-layout";
import type { RoomSeatType } from "src/modules/rooms/domain/room-seat-type";

import type { SessionSeatStatus } from "../domain/session-seat-status";

export type MaterializeSessionSeatsInput = {
  tenantId: string;
  sessionId: string;
  roomLayoutSnapshot: RoomSeatLayout;
};

export type MaterializeSessionSeatsOutput = {
  id: string;
  tenantId: string;
  sessionId: string;
  seatKey: string;
  rowLabel: string;
  seatNumber: number;
  seatType: RoomSeatType;
  status: SessionSeatStatus;
  isAccessibilitySeat: boolean;
  createdAt: Date;
  updatedAt: Date;
};
