import { createTenantController } from "./controllers/create-tenant.controller";
import { requireAuth } from "./middlewares/requireAuth";
import { protectedPingController } from "./controllers/protectedPing.controller";
export async function registerIamRoutes(app) {
    app.get("/protected/ping", { preHandler: [requireAuth] }, protectedPingController);
    app.post("/tenants", createTenantController);
}
