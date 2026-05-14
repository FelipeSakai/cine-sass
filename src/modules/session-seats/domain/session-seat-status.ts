export const sessionSeatStatuses = ["AVAILABLE", "BLOCKED", "HELD", "RESERVED"] as const;


export type SessionSeatStatus = (typeof sessionSeatStatuses)[number];
