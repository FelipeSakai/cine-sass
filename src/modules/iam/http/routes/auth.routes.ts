import { FastifyInstance } from "fastify";
import { authLoginController } from "../controllers/auth-login.controller";
import { authRefreshController } from "../controllers/auth-refresh.controller";
import { authLogoutController } from "../controllers/auth-logout.controller";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/login", authLoginController);
  app.post("/auth/refresh", authRefreshController);
  app.post("/auth/logout", authLogoutController);
}
