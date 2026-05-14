import type { ReservationStatus } from "../domain/reservation-status";

export type CreateReservationInput = {
  tenantId: string;
  sessionId: string;
  actorUserId: string;
  seatIds: string[];
};

export type CreateReservationOutput = {
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
