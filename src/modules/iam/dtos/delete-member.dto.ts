import { z } from "zod";

export const deleteMemberParamsSchema = z.object({
  userId: z.string().uuid(),
});

export type DeleteMemberParams = z.infer<typeof deleteMemberParamsSchema>;
