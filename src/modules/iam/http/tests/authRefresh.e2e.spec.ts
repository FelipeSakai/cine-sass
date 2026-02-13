import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../../../http/app";
import { FastifyInstance } from "fastify";

let app: FastifyInstance;

describe("POST /auth/refresh", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should rotate refresh token and return new access/refresh tokens", async () => {
    await request(app.server).post("/tenants").send({
      tenantName: "Cine Sakai",
      tenantSlug: "cine-sakai-refresh",
      ownerEmail: "refresh@cine.com",
      ownerPassword: "password123",
    });

    const login = await request(app.server).post("/auth/login").send({
      email: "refresh@cine.com",
      password: "password123",
    });

    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty("accessToken");
    expect(login.body).toHaveProperty("refreshToken");

    const oldRefreshToken = login.body.refreshToken as string;

    const refresh = await request(app.server).post("/auth/refresh").send({
      refreshToken: oldRefreshToken,
    });

    expect(refresh.status).toBe(200);
    expect(refresh.body).toHaveProperty("accessToken");
    expect(refresh.body).toHaveProperty("refreshToken");

    const refreshWithOld = await request(app.server)
      .post("/auth/refresh")
      .send({
        refreshToken: oldRefreshToken,
      });

    expect(refreshWithOld.status).toBe(401);

    const newRefreshToken = refresh.body.refreshToken as string;

    expect(newRefreshToken).not.toBe(oldRefreshToken);

    const refreshWithNew = await request(app.server)
      .post("/auth/refresh")
      .send({
        refreshToken: newRefreshToken,
      });

    expect(refreshWithNew.status).toBe(200);
    expect(refreshWithNew.body).toHaveProperty("accessToken");
    expect(refreshWithNew.body).toHaveProperty("refreshToken");
  });

  it("should return 400 when body is invalid (zod)", async () => {
    const res = await request(app.server).post("/auth/refresh").send({
      refreshToken: "",
    });

    expect(res.status).toBe(400);
  });

  it("should return 401 when refresh token is invalid", async () => {
    const res = await request(app.server).post("/auth/refresh").send({
      refreshToken: "invalid-refresh-token-1234567890",
    });

    expect(res.status).toBe(401);
  });
});
