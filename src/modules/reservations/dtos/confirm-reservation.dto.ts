import type { ReservationStatus } from "../domain/reservation-status";

export type ConfirmReservationInput = {
  tenantId: string;
  reservationId: string;
};

export type ConfirmReservationOutput = {
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
