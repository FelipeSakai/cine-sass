import { FastifyInstance } from "fastify";
import { authLoginController } from "./controllers/authLogin.controller";
import { authRefreshController } from "./controllers/authRefresh.controller";
import { authLogoutController } from "./controllers/authLogout.controller";

export async function registerAutRoutes(app: FastifyInstance) {
  app.post("/auth/login", authLoginController);
  app.post("/auth/refresh", authRefreshController);
  app.post("/auth/logout", authLogoutController);
}
