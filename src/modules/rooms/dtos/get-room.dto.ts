import type { RoomSeatLayout } from "../domain/room-seat-layout";

export type GetRoomInput = {
  tenantId: string;
  roomId: string;
};

export type GetRoomOutput = {
  id: string;
  tenantId: string;
  name: string;
  seatLayout: RoomSeatLayout;
  seatCount: number;
  createdAt: Date;
  updatedAt: Date;
};
