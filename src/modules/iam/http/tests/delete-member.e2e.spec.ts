import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

import { buildApp } from "../../../../http/app";
import { Role } from "../../domain/role";

let app: FastifyInstance;

async function createTenantAndLoginOwner() {
  const ownerEmail = `owner-${Date.now()}@cine.com`;

  const tenantRes = await request(app.server).post("/tenants").send({
    tenantName: "Cine Delete Member",
    tenantSlug: `cine-delete-member-${Date.now()}`,
    ownerEmail,
    ownerPassword: "password123",
  });

  expect(tenantRes.status).toBe(201);

  const ownerLogin = await request(app.server).post("/auth/login").send({
    email: ownerEmail,
    password: "password123",
  });

  expect(ownerLogin.status).toBe(200);

  const tenantId =
    (ownerLogin.body.defaultTenantId as string | undefined) ??
    (ownerLogin.body.memberships?.[0]?.tenantId as string | undefined);

  expect(tenantId).toBeTruthy();

  return {
    tenantId: tenantId!,
    ownerAccessToken: ownerLogin.body.accessToken as string,
  };
}

async function createMember(params: {
  tenantId: string;
  accessToken: string;
  email: string;
  role: Role;
}) {
  const response = await request(app.server)
    .post("/members")
    .set("Authorization", `Bearer ${params.accessToken}`)
    .set("x-tenant-id", params.tenantId)
    .send({
      email: params.email,
      password: "password123",
      role: params.role,
    });

  expect(response.status).toBe(201);

  return {
    userId: response.body.userId as string,
  };
}

async function login(email: string) {
  const response = await request(app.server).post("/auth/login").send({
    email,
    password: "password123",
  });

  expect(response.status).toBe(200);

  return response.body.accessToken as string;
}

describe("DELETE /members/:userId", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should allow owner to remove a member from the tenant", async () => {
    const { tenantId, ownerAccessToken } = await createTenantAndLoginOwner();
    const memberEmail = `member-${Date.now()}@cine.com`;

    const member = await createMember({
      tenantId,
      accessToken: ownerAccessToken,
      email: memberEmail,
      role: Role.STAFF,
    });

    const deleteResponse = await request(app.server)
      .delete(`/members/${member.userId}`)
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .set("x-tenant-id", tenantId);

    expect(deleteResponse.status).toBe(204);

    const membersResponse = await request(app.server)
      .get("/members")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .set("x-tenant-id", tenantId);

    expect(membersResponse.status).toBe(200);
    expect(membersResponse.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: member.userId,
          email: memberEmail,
        }),
      ]),
    );
  });

  it("should forbid admin from removing another admin", async () => {
    const { tenantId, ownerAccessToken } = await createTenantAndLoginOwner();
    const adminEmail = `admin-${Date.now()}@cine.com`;
    const otherAdminEmail = `other-admin-${Date.now()}@cine.com`;

    await createMember({
      tenantId,
      accessToken: ownerAccessToken,
      email: adminEmail,
      role: Role.ADMIN,
    });

    const otherAdmin = await createMember({
      tenantId,
      accessToken: ownerAccessToken,
      email: otherAdminEmail,
      role: Role.ADMIN,
    });

    const adminAccessToken = await login(adminEmail);

    const deleteResponse = await request(app.server)
      .delete(`/members/${otherAdmin.userId}`)
      .set("Authorization", `Bearer ${adminAccessToken}`)
      .set("x-tenant-id", tenantId);

    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.message).toBe("Forbidden");
  });

  it("should forbid removing yourself from the tenant", async () => {
    const { tenantId, ownerAccessToken } = await createTenantAndLoginOwner();

    const meResponse = await request(app.server)
      .get("/me")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .set("x-tenant-id", tenantId);

    expect(meResponse.status).toBe(200);

    const deleteResponse = await request(app.server)
      .delete(`/members/${meResponse.body.userId}`)
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .set("x-tenant-id", tenantId);

    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.message).toBe("Forbidden");
  });
});
