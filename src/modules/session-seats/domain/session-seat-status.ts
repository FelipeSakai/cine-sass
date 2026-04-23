export const sessionSeatStatuses = ["AVAILABLE", "BLOCKED", "RESERVED"] as const;

export type SessionSeatStatus = (typeof sessionSeatStatuses)[number];
