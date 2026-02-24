import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";

import { buildApp } from "../../../../http/app";

import { db } from "src/shared/db/client";
import { memberships, users } from "src/shared/db/schema";
import { Role } from "../../domain/role";

let app: FastifyInstance;

describe("GET /protected/admin-ping (RBAC)", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should allow OWNER and deny VIEWER", async () => {
    const ownerEmail = `owner-${Date.now()}@cine.com`;

    const tenantRes = await request(app.server).post("/tenants").send({
      tenantName: "Cine RBAC",
      tenantSlug: `cine-rbac-${Date.now()}`,
      ownerEmail,
      ownerPassword: "password123",
    });

    expect(tenantRes.status).toBe(201);

    const ownerLogin = await request(app.server).post("/auth/login").send({
      email: ownerEmail,
      password: "password123",
    });

    expect(ownerLogin.status).toBe(200);

    const ownerAccessToken = ownerLogin.body.accessToken as string;

    const tenantId =
      (ownerLogin.body.defaultTenantId as string | undefined) ??
      (ownerLogin.body.memberships?.[0]?.tenantId as string | undefined);

    expect(tenantId).toBeTruthy();

    const ownerPing = await request(app.server)
      .get("/protected/admin-ping")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .set("x-tenant-id", tenantId!);

    expect(ownerPing.status).toBe(200);
    expect(ownerPing.body.ok).toBe(true);

    const viewerEmail = `viewer-${Date.now()}@cine.com`;
    const viewerPassword = "password123";
    const viewerPasswordHash = await bcrypt.hash(viewerPassword, 8);

    const insertedUsers = await db
      .insert(users)
      .values({
        email: viewerEmail,
        passwordHash: viewerPasswordHash,
        isActive: true,
      })
      .returning({ id: users.id });

    const viewerUserId = insertedUsers[0]!.id;

    await db.insert(memberships).values({
      tenantId: tenantId!,
      userId: viewerUserId,
      role: Role.VIEWER,
    });

    const viewerLogin = await request(app.server).post("/auth/login").send({
      email: viewerEmail,
      password: viewerPassword,
    });

    expect(viewerLogin.status).toBe(200);

    const viewerAccessToken = viewerLogin.body.accessToken as string;

    const viewerPing = await request(app.server)
      .get("/protected/admin-ping")
      .set("Authorization", `Bearer ${viewerAccessToken}`)
      .set("x-tenant-id", tenantId!);

    expect(viewerPing.status).toBe(403);
  });
});
