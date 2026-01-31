import fastify from "fastify";
import { errorHandler } from "src/shared/errors/error-handler";
import { loggerOptions } from "src/shared/logger";

export async function buildApp() {
  const app = fastify({
    logger: loggerOptions,
  });
  app.get("/health", async () => ({ ok: true }));

//   await registerIamRoutes(app);

  app.setErrorHandler(errorHandler);

  return app;
}
