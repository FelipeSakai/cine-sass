import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { buildApp } from "../../../../http/app";

let app: FastifyInstance;

describe("GET /protected/tenant-ping", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 400 when x-tenant-id is missing", async () => {
    const accessToken = app.jwt.sign({ sub: "test-user-id" });

    const res = await request(app.server)
      .get("/protected/tenant-ping")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

  it("should return 400 when x-tenant-id is not a uuid", async () => {
    const accessToken = app.jwt.sign({ sub: "test-user-id" });

    const res = await request(app.server)
      .get("/protected/tenant-ping")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-tenant-id", "not-a-uuid");

    expect(res.status).toBe(400);
  });

  it("should return 403 when user is not member of the tenant", async () => {
    const email = `forbidden-${Date.now()}@cine.com`;

    const tenantRes = await request(app.server)
      .post("/tenants")
      .send({
        tenantName: "CineTenantForbidden",
        tenantSlug: `cine-tenant-forbidden-${Date.now()}`,
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

    const otherTenantId = randomUUID();

    const res = await request(app.server)
      .get("/protected/tenant-ping")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-tenant-id", otherTenantId);

    expect(res.status).toBe(403);
  });

  it("should return 200 with correct tenant context", async () => {
    const email = `ok-${Date.now()}@cine.com`;

    const tenantRes = await request(app.server)
      .post("/tenants")
      .send({
        tenantName: "CineTenantPingOK",
        tenantSlug: `cine-tenant-ok-${Date.now()}`,
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

    const res = await request(app.server)
      .get("/protected/tenant-ping")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-tenant-id", tenantId!);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.tenantId).toBe(tenantId);
    expect(res.body.role).toBeTruthy();
  });
});
