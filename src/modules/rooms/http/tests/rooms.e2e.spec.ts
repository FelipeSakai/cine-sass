import type { FastifyInstance } from "fastify";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "src/http/app";
import { Role } from "src/modules/iam/domain/role";

let app: FastifyInstance;

function buildSeatLayout(activeSeatsPerRow = 2) {
  return {
    rows: [
      {
        label: "A",
        seats: Array.from({ length: activeSeatsPerRow }, (_, index) => ({
          number: index + 1,
          type: "STANDARD" as const,
          active: true,
        })),
      },
      {
        label: "B",
        seats: Array.from({ length: activeSeatsPerRow }, (_, index) => ({
          number: index + 1,
          type: "STANDARD" as const,
          active: true,
        })),
      },
    ],
  };
}

async function createTenantAndLoginOwner(prefix: string) {
  const timestamp = Date.now();
  const ownerEmail = `${prefix}-${timestamp}@cine.com`;

  const tenantResponse = await request(app.server)
    .post("/tenants")
    .send({
      tenantName: `Cinema ${prefix}`,
      tenantSlug: `${prefix}-${timestamp}`,
      ownerEmail,
      ownerPassword: "password123",
    });

  expect(tenantResponse.status).toBe(201);

  const loginResponse = await request(app.server).post("/auth/login").send({
    email: ownerEmail,
    password: "password123",
  });

  expect(loginResponse.status).toBe(200);

  return {
    tenantId: (loginResponse.body.defaultTenantId ??
      loginResponse.body.memberships?.[0]?.tenantId) as string,
    accessToken: loginResponse.body.accessToken as string,
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
}

async function login(email: string) {
  const response = await request(app.server).post("/auth/login").send({
    email,
    password: "password123",
  });

  expect(response.status).toBe(200);

  return response.body.accessToken as string;
}

describe("rooms routes", () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should allow staff to create a room", async () => {
    const owner = await createTenantAndLoginOwner("rooms-staff");
    const staffEmail = `staff-${Date.now()}@cine.com`;

    await createMember({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      email: staffEmail,
      role: Role.STAFF,
    });

    const staffAccessToken = await login(staffEmail);

    const response = await request(app.server)
      .post("/rooms")
      .set("Authorization", `Bearer ${staffAccessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        name: "Room 1",
        seatLayout: buildSeatLayout(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      tenantId: owner.tenantId,
      name: "Room 1",
      seatCount: 4,
    });
    expect(response.body.id).toBeTruthy();
  });

  it("should reject an invalid room layout", async () => {
    const owner = await createTenantAndLoginOwner("rooms-invalid-layout");

    const response = await request(app.server)
      .post("/rooms")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        name: "Broken Room",
        seatLayout: {
          rows: [
            {
              label: "A",
              seats: [
                { number: 1, type: "STANDARD", active: false },
                { number: 2, type: "STANDARD", active: false },
              ],
            },
          ],
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation error");
  });

  it("should reject duplicate room names in the same tenant", async () => {
    const owner = await createTenantAndLoginOwner("rooms-duplicate");

    const firstResponse = await request(app.server)
      .post("/rooms")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({ name: "Blue Room", seatLayout: buildSeatLayout() });

    expect(firstResponse.status).toBe(201);

    const secondResponse = await request(app.server)
      .post("/rooms")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({ name: "Blue Room", seatLayout: buildSeatLayout(3) });

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.message).toBe("Room name already exists");
  });

  it("should list and get rooms only inside the active tenant", async () => {
    const tenantA = await createTenantAndLoginOwner("rooms-tenant-a");
    const tenantB = await createTenantAndLoginOwner("rooms-tenant-b");

    const createResponse = await request(app.server)
      .post("/rooms")
      .set("Authorization", `Bearer ${tenantA.accessToken}`)
      .set("x-tenant-id", tenantA.tenantId)
      .send({ name: "Tenant A Room", seatLayout: buildSeatLayout() });

    expect(createResponse.status).toBe(201);

    const tenantAList = await request(app.server)
      .get("/rooms")
      .set("Authorization", `Bearer ${tenantA.accessToken}`)
      .set("x-tenant-id", tenantA.tenantId);

    const tenantBList = await request(app.server)
      .get("/rooms")
      .set("Authorization", `Bearer ${tenantB.accessToken}`)
      .set("x-tenant-id", tenantB.tenantId);

    const tenantBGet = await request(app.server)
      .get(`/rooms/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${tenantB.accessToken}`)
      .set("x-tenant-id", tenantB.tenantId);

    expect(tenantAList.status).toBe(200);
    expect(tenantAList.body).toHaveLength(1);
    expect(tenantAList.body[0].name).toBe("Tenant A Room");

    expect(tenantBList.status).toBe(200);
    expect(tenantBList.body).toHaveLength(0);

    expect(tenantBGet.status).toBe(404);
    expect(tenantBGet.body.message).toBe("Room not found");
  });

  it("should patch room name and layout", async () => {
    const owner = await createTenantAndLoginOwner("rooms-patch");

    const createResponse = await request(app.server)
      .post("/rooms")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({ name: "Old Room", seatLayout: buildSeatLayout() });

    expect(createResponse.status).toBe(201);

    const updatedLayout = {
      rows: [
        {
          label: "A",
          seats: [
            { number: 1, type: "STANDARD", active: true },
            { number: 2, type: "STANDARD", active: true },
            { number: 3, type: "STANDARD", active: false },
          ],
        },
        {
          label: "B",
          seats: [{ number: 1, type: "STANDARD", active: true }],
        },
      ],
    };

    const patchResponse = await request(app.server)
      .patch(`/rooms/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        name: "Updated Room",
        seatLayout: updatedLayout,
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body).toMatchObject({
      id: createResponse.body.id,
      name: "Updated Room",
      seatCount: 3,
    });

    const getResponse = await request(app.server)
      .get(`/rooms/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.name).toBe("Updated Room");
    expect(getResponse.body.seatCount).toBe(3);
    expect(getResponse.body.seatLayout).toEqual(updatedLayout);
  });
});
