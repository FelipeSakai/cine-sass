import type { RoomSeatLayout } from "../domain/room-seat-layout";

export type CreateRoomInput = {
  tenantId: string;
  name: string;
  seatLayout: RoomSeatLayout;
};

export type CreateRoomOutput = {
  id: string;
  tenantId: string;
  name: string;
  seatLayout: RoomSeatLayout;
  seatCount: number;
  createdAt: Date;
  updatedAt: Date;
};
