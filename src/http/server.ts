import { pool } from "../shared/db/client";
import { buildApp } from "./app";
import { env } from "../shared/env";

let shuttingDown = false;

async function start() {
  const app = await buildApp();

  const shutdown = async (signal?: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;

    app.log.info({ signal }, "Shutting down gracefully...");

    try {
      await app.close();
      await pool.end();
      console.log("Shutdown complete");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info({ port: env.PORT }, "Server running");
  } catch (err) {
    app.log.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

start();
