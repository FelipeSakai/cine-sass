import { z } from "zod";

import { roomSeatTypes } from "./room-seat-type";

const seatSchema = z.object({
  number: z.int().positive(),
  type: z.enum(roomSeatTypes),
  active: z.boolean(),
});

const rowSchema = z.object({
  label: z.string().trim().min(1).max(10),
  seats: z.array(seatSchema).min(1),
});

export const roomSeatLayoutSchema = z
  .object({
    rows: z.array(rowSchema).min(1),
  })
  .superRefine((layout, ctx) => {
    const rowLabels = new Set<string>();
    let activeSeatCount = 0;

    layout.rows.forEach((row, rowIndex) => {
      const normalizedRowLabel = row.label.trim().toUpperCase();

      if (rowLabels.has(normalizedRowLabel)) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", rowIndex, "label"],
          message: "Row labels must be unique",
        });
      }

      rowLabels.add(normalizedRowLabel);

      const seatNumbers = new Set<number>();

      row.seats.forEach((seat, seatIndex) => {
        if (seatNumbers.has(seat.number)) {
          ctx.addIssue({
            code: "custom",
            path: ["rows", rowIndex, "seats", seatIndex, "number"],
            message: "Seat numbers must be unique within each row",
          });
        }

        seatNumbers.add(seat.number);

        if (seat.active) {
          activeSeatCount += 1;
        }
      });
    });

    if (activeSeatCount === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["rows"],
        message: "Room layout must contain at least one active seat",
      });
    }
  });

export type RoomSeatLayout = z.infer<typeof roomSeatLayoutSchema>;

export function countActiveSeats(layout: RoomSeatLayout) {
  return layout.rows.reduce(
    (total, row) => total + row.seats.filter((seat) => seat.active).length,
    0,
  );
}
