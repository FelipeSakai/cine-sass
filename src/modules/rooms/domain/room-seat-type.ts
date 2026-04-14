export const roomSeatTypes = ["STANDARD"] as const;

export type RoomSeatType = (typeof roomSeatTypes)[number];
