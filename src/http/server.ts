import Fastify from "fastify";
import { loggerOptions } from "../shared/logger";
import { errorHandler } from "../shared/errors/error-handler";
import { pool } from "../shared/db/client";

const app = Fastify({ logger: loggerOptions });
const PORT = Number(process.env.PORT) || 3333;

app.setErrorHandler(errorHandler);

app.get("/health", async () => {
  return { ok: true };
});

let shuttingDown = false;

const start = async () => {
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info({ port: PORT }, "Server running");
  } catch (err) {
    app.log.error({ err }, "Failed to start server");
    process.exit(1);
  }
};

const closeApp = async (signal?: NodeJS.Signals) => {
  if (shuttingDown) return;
  shuttingDown = true;

  app.log.info({ signal }, "Shutting down gracefully...");

  try {
    await app.close();
    await pool.end();
    app.log.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    app.log.error({ err }, "Error during shutdown");
    process.exit(1);
  }
};

start();
process.on("SIGINT", closeApp);
process.on("SIGTERM", closeApp);
