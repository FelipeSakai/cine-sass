import fastify from "fastify";
import jwt from "@fastify/jwt";

import { errorHandler } from "src/shared/errors/error-handler";
import { loggerOptions } from "src/shared/logger";
import { env } from "src/shared/env";

import { registerIamRoutes } from "src/modules/iam/http/routes/iam.routes";
import { registerAuthRoutes } from "src/modules/iam/http/routes/auth.routes";
import { registerMoviesRoutes } from "src/modules/movies/http/routes/movies.routes";
import { registerRoomsRoutes } from "src/modules/rooms/http/routes/rooms.routes";

export async function buildApp() {
  const app = fastify({
    logger: loggerOptions,
  });

  app.setErrorHandler(errorHandler);

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_TTL,
    },
  });

  app.get("/health", async () => ({ ok: true }));

  await registerIamRoutes(app);
  await registerAuthRoutes(app);
  await registerMoviesRoutes(app);
  await registerRoomsRoutes(app);

  return app;
}
