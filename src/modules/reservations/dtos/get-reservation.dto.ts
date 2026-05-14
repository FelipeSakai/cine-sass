import type { ReservationStatus } from "../domain/reservation-status";

export type GetReservationInput = {
  tenantId: string;
  reservationId: string;
};

export type GetReservationOutput = {
  reservationId: string;
  sessionId: string;
  status: ReservationStatus;
  expiresAt: Date;
  seatCount: number;
  seats: Array<{
    id: string;
    seatKey: string;
  }>;
};
