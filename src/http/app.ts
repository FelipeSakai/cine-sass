import fastify from "fastify";
import { errorHandler } from "src/shared/errors/error-handler";
import { loggerOptions } from "src/shared/logger";
import { registerIamRoutes } from "src/modules/iam/http/iam.routes";

export async function buildApp() {
  const app = fastify({
    logger: loggerOptions,
  });
  app.setErrorHandler(errorHandler);

  app.get("/health", async () => ({ ok: true }));

  await registerIamRoutes(app);

  return app;
}
