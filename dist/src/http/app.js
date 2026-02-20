import fastify from "fastify";
import jwt from "@fastify/jwt";
import { errorHandler } from "src/shared/errors/error-handler";
import { loggerOptions } from "src/shared/logger";
import { env } from "src/shared/env";
import { registerIamRoutes } from "src/modules/iam/http/iam.routes";
import { registerAuthRoutes } from "src/modules/iam/http/auth.routes";
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
    return app;
}
