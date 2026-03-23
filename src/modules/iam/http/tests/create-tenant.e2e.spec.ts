import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../../../http/app";
import { FastifyInstance } from "fastify";

let app: FastifyInstance;

describe("POST /tenants", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a tenant, owner and membership", async () => {
    const res = await request(app.server).post("/tenants").send({
      tenantName: "Cine Sakai",
      tenantSlug: "cine-sakai",
      ownerEmail: "owner@cine.com",
      ownerPassword: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("tenantId");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("membershipId");
  });

  it("should return 400 when body is invalid (zod)", async () => {
    const res = await request(app.server).post("/tenants").send({
      tenantName: "C",
      tenantSlug: "Cine Sakai",
      ownerEmail: "email invalid",
      ownerPassword: "123",
    });

    expect(res.status).toBe(400);
  });

  it("should return 409 when tenantSlug already exists", async () => {
    const res = await request(app.server).post("/tenants").send({
      tenantName: "Cine Sakai",
      tenantSlug: "cine-sakai",
      ownerEmail: "owner@cine.com",
      ownerPassword: "password123",
    });

    const res2 = await request(app.server).post("/tenants").send({
      tenantName: "Cine Sakai 2",
      tenantSlug: "cine-sakai",
      ownerEmail: "owner2@cine.com",
      ownerPassword: "password123",
    });

    expect(res2.status).toBe(409);
  });

  it("should return 409 when ownerEmail already exists", async () => {
    await request(app.server).post("/tenants").send({
      tenantName: "Cine Sakai",
      tenantSlug: "cine-sakai",
      ownerEmail: "owner@cine.com",
      ownerPassword: "password123",
    });

    const res2 = await request(app.server).post("/tenants").send({
      tenantName: "Cine Sakai 2",
      tenantSlug: "cine-sakai2",
      ownerEmail: "owner@cine.com",
      ownerPassword: "password123",
    });

    expect(res2.status).toBe(409);
  });
});
