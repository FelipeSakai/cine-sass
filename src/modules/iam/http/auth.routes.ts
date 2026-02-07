import { FastifyInstance } from "fastify";
import { authLoginController } from "./controllers/authLogin.controller";

export async function registerAutRoutes(app: FastifyInstance) {
    app.post("/auth/login",authLoginController)
}
