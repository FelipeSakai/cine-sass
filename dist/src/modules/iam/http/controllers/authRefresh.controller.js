import { z } from "zod";
import { makeAuthRefreshService } from "../../factories/makeAuthRefreshService.factory";
const bodySchema = z.object({
    refreshToken: z.string().min(10),
});
export async function authRefreshController(req, reply) {
    const body = bodySchema.parse(req.body);
    const service = makeAuthRefreshService(req.server);
    const result = await service.execute(body);
    return reply.status(200).send(result);
}
