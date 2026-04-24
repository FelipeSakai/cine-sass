import type { RoomSeatType } from "src/modules/rooms/domain/room-seat-type";

import type { SessionSeatStatus } from "../domain/session-seat-status";

export type UpdateSessionSeatStatusInput = {
  tenantId: string;
  sessionId: string;
  seatId: string;
};

export type UpdateSessionSeatStatusOutput = {
  id: string;
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
