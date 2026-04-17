export const sessionStatuses = ["SCHEDULED", "CANCELLED"] as const;

export type SessionStatus = (typeof sessionStatuses)[number];
