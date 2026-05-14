import type { RoomSeatType } from "src/modules/rooms/domain/room-seat-type";

import type { SessionSeatStatus } from "../domain/session-seat-status";

export type ListSessionSeatsInput = {
  tenantId: string;
  sessionId: string;
};

export type ListSessionSeatsOutput = {
  sessionId: string;
  summary: {
    total: number;
    available: number;
    blocked: number;
    held: number;
    reserved: number;
  };
  seats: ListSessionSeatsOutputItem[];
};

export type ListSessionSeatsOutputItem = {
  id: string;
  seatKey: string;
  rowLabel: string;
  seatNumber: number;
  seatType: RoomSeatType;
  status: SessionSeatStatus;
  isAccessibilitySeat: boolean;
};
