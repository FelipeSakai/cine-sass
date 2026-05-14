export const reservationStatuses = ["HOLD", "CONFIRMED", "CANCELLED", "EXPIRED"] as const;

export type ReservationStatus = (typeof reservationStatuses)[number];
