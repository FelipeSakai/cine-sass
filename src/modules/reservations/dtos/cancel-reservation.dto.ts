import type { ReservationStatus } from "../domain/reservation-status";

export type CancelReservationInput = {
  tenantId: string;
  reservationId: string;
};

export type CancelReservationOutput = {
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
