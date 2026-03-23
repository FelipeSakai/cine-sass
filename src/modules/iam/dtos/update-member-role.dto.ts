import { z } from "zod";
import { Role } from "../domain/role";

export const updateMemberRoleParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const updateMemberRoleBodySchema = z.object({
  role: z.nativeEnum(Role),
});

export type UpdateMemberRoleParams = z.infer<
  typeof updateMemberRoleParamsSchema
>;

export type UpdateMemberRoleBody = z.infer<typeof updateMemberRoleBodySchema>;
