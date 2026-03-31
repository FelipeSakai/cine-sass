import type { FastifyInstance } from "fastify";
import { importMovieController } from "../controllers/import-movie.controller";
import { listMoviesController } from "../controllers/list-movies.controller";
import { searchExternalMoviesController } from "../controllers/search-external-movies.controller";
import { requireAuth } from "src/modules/iam/http/middlewares/require-auth";
import { requireTenant } from "src/modules/iam/http/middlewares/require-tenant";

export async function registerMoviesRoutes(app: FastifyInstance) {
  app.get(
    "/movies/search",
    { preHandler: [requireAuth, requireTenant] },
    searchExternalMoviesController,
  );
  app.post(
    "/movies/import",
    { preHandler: [requireAuth, requireTenant] },
    importMovieController,
  );
  app.get(
    "/movies",
    { preHandler: [requireAuth, requireTenant] },
    listMoviesController,
  );
}
