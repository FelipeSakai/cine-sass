import fastify from "fastify";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { dirname, resolve } from "node:path";

import { errorHandler } from "src/shared/errors/error-handler";
import { loggerOptions } from "src/shared/logger";
import { env } from "src/shared/env";

import { registerIamRoutes } from "src/modules/iam/http/routes/iam.routes";
import { registerAuthRoutes } from "src/modules/iam/http/routes/auth.routes";
import { registerMoviesRoutes } from "src/modules/movies/http/routes/movies.routes";
import { registerRoomsRoutes } from "src/modules/rooms/http/routes/rooms.routes";
import { registerSessionSeatsRoutes } from "src/modules/session-seats/http/routes/session-seats.routes";
import { registerReservationsRoutes } from "src/modules/reservations/http/routes/reservations.routes";
import { registerSessionsRoutes } from "src/modules/sessions/http/routes/sessions.routes";

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

  await app.register(swagger, {
    mode: "static",
    specification: {
      path: resolve(process.cwd(), "specs/openapi-v1.json"),
      baseDir: dirname(resolve(process.cwd(), "specs/openapi-v1.json")),
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    staticCSP: true,
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  app.get("/health", async () => ({ ok: true }));

  await registerIamRoutes(app);
  await registerAuthRoutes(app);
  await registerMoviesRoutes(app);
  await registerRoomsRoutes(app);
  await registerSessionsRoutes(app);
  await registerSessionSeatsRoutes(app);
  await registerReservationsRoutes(app);

  return app;
}
