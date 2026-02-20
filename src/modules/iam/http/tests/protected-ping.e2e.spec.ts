import request from "supertest";
import { FastifyInstance } from "fastify";
import { buildApp } from "src/http/app";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let app: FastifyInstance;

describe("GET /protected/ping", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 401 without token", async () => {
    const res = await request(app.server).get("/protected/ping");
    expect(res.status).toBe(401);
  });

  it("should return 200 with valid token", async () => {
    const accessToken = app.jwt.sign({ sub: "test-user-id" });
    const res = await request(app.server)
      .get("/protected/ping")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      userId: "test-user-id",
    });
  });
});
