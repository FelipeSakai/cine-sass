import type { RoomSeatLayout } from "../domain/room-seat-layout";

export type UpdateRoomInput = {
  tenantId: string;
  roomId: string;
  name?: string;
  seatLayout?: RoomSeatLayout;
};

export type UpdateRoomOutput = {
  id: string;
  tenantId: string;
  name: string;
  seatLayout: RoomSeatLayout;
  seatCount: number;
  createdAt: Date;
  updatedAt: Date;
};
