import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../../http/app";

let app: FastifyInstance;

describe("GET /me", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 401 without token", async () => {
    const res = await request(app.server).get("/me");
    expect(res.status).toBe(401);
  });

  it("should return 400 without x-tenant-id", async () => {
    const token = app.jwt.sign({ sub: "test-user-id" });

    const res = await request(app.server)
      .get("/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("should return 200 with tenant context", async () => {
    const email = `me-${Date.now()}@cine.com`;

    const tenantRes = await request(app.server)
      .post("/tenants")
      .send({
        tenantName: "Cine Me",
        tenantSlug: `cine-me-${Date.now()}`,
        ownerEmail: email,
        ownerPassword: "password123",
      });

    expect(tenantRes.status).toBe(201);

    const login = await request(app.server).post("/auth/login").send({
      email,
      password: "password123",
    });

    expect(login.status).toBe(200);

    const accessToken = login.body.accessToken as string;

    const tenantId =
      (login.body.defaultTenantId as string | undefined) ??
      (login.body.memberships?.[0]?.tenantId as string | undefined);

    expect(tenantId).toBeTruthy();

    const me = await request(app.server)
      .get("/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-tenant-id", tenantId!);

    expect(me.status).toBe(200);
    expect(me.body.userId).toBeTruthy();
    expect(me.body.tenantId).toBe(tenantId);
    expect(me.body.role).toBeTruthy();
    expect(me.body.email).toBe(email);
  });
});
