import type { RoomSeatLayout } from "../domain/room-seat-layout";

export type ListRoomsInput = {
  tenantId: string;
};

export type ListRoomsOutputItem = {
  id: string;
  tenantId: string;
  name: string;
  seatLayout: RoomSeatLayout;
  seatCount: number;
  createdAt: Date;
  updatedAt: Date;
};
