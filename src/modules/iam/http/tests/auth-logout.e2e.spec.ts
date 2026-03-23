import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../../http/app";

let app: FastifyInstance;

describe("POST /auth/logout", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should revoke refresh token and deny further refresh", async () => {
    const tenantRes = await request(app.server).post("/tenants").send({
      tenantName: "CineLogout",
      tenantSlug: "cine-sakai-logout",
      ownerEmail: "logout@cine.com",
      ownerPassword: "password123",
    });
    expect(tenantRes.status).toBe(201);

    const login = await request(app.server).post("/auth/login").send({
      email: "logout@cine.com",
      password: "password123",
    });
    expect(login.status).toBe(200);

    const refreshToken = login.body.refreshToken as string;

    const logout = await request(app.server).post("/auth/logout").send({
      refreshToken,
    });
    expect(logout.status).toBe(204);

    const refresh = await request(app.server).post("/auth/refresh").send({
      refreshToken,
    });
    expect(refresh.status).toBe(401);
  });

  it("should be idempotent when token does not exist", async () => {
    const logout = await request(app.server).post("/auth/logout").send({
      refreshToken: "invalid-refresh-token-1234567890",
    });

    expect(logout.status).toBe(204);
  });
});
