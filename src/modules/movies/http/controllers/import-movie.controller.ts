import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { movieSourceProviders } from "../../domain/movie-source-provider";
import { makeImportMovieService } from "../../factories/make-import-movie-service.factory";

const bodySchema = z.object({
  sourceProvider: z.enum(movieSourceProviders),
  sourceMovieId: z.string().trim().min(1),
});

export async function importMovieController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(request.body);

  const service = makeImportMovieService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    sourceProvider: body.sourceProvider,
    sourceMovieId: body.sourceMovieId,
  });

  return reply.status(result.imported ? 201 : 200).send(result);
}
