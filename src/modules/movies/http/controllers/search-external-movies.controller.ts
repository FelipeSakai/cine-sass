import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { movieSourceProviders } from "../../domain/movie-source-provider";
import { makeSearchExternalMoviesService } from "../../factories/make-search-external-movies-service.factory";

const querystringSchema = z.object({
  query: z.string().trim().min(1),
  page: z.coerce.number().int().positive().optional(),
  provider: z.enum(movieSourceProviders).optional(),
});

export async function searchExternalMoviesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querystring = querystringSchema.parse(request.query);

  const service = makeSearchExternalMoviesService();
  const result = await service.execute({
    tenantId: request.tenant!.id,
    query: querystring.query,
    page: querystring.page,
    provider: querystring.provider,
  });

  return reply.status(200).send(result);
}
