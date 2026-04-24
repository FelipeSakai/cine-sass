import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { buildApp } from "src/http/app";
import { Role } from "src/modules/iam/domain/role";
import { db } from "src/shared/db/client";
import { catalogSessionSeats } from "src/shared/db/schema";

let app: FastifyInstance;
let originalTmdbApiKey: string | undefined;

function buildMixedSeatLayout() {
  return {
    rows: [
      {
        label: "A",
        seats: [
          { number: 1, type: "STANDARD" as const, active: true },
          { number: 2, type: "STANDARD" as const, active: false },
          { number: 3, type: "STANDARD" as const, active: true },
        ],
      },
      {
        label: "B",
        seats: [
          { number: 1, type: "STANDARD" as const, active: true },
          { number: 2, type: "STANDARD" as const, active: false },
        ],
      },
    ],
  };
}

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function mockMovieCatalog() {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);

    if (url.includes("/movie/603")) {
      return createJsonResponse({
        id: 603,
        title: "The Matrix",
        original_title: "The Matrix",
        overview: "Neo discovers the truth.",
        poster_path: "/matrix-poster.jpg",
        backdrop_path: "/matrix-backdrop.jpg",
        release_date: "1999-03-31",
        runtime: 136,
        genres: [],
        original_language: "en",
        popularity: 95.4,
        vote_average: 8.2,
        vote_count: 25000,
      });
    }

    throw new Error(`Unexpected fetch call: ${url}`);
  });
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

async function importMovie(auth: { tenantId: string; accessToken: string }, sourceMovieId = "603") {
  const response = await request(app.server)
    .post("/movies/import")
    .set("Authorization", `Bearer ${auth.accessToken}`)
    .set("x-tenant-id", auth.tenantId)
    .send({
      sourceProvider: "TMDB",
      sourceMovieId,
    });

  expect([200, 201]).toContain(response.status);

  return response.body.movieId as string;
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

async function createRoomWithSeatLayout(
  auth: { tenantId: string; accessToken: string },
  seatLayout: ReturnType<typeof buildMixedSeatLayout>,
  name = "Room 1",
) {
  const response = await request(app.server)
    .post("/rooms")
    .set("Authorization", `Bearer ${auth.accessToken}`)
    .set("x-tenant-id", auth.tenantId)
    .send({
      name,
      seatLayout,
    });

  expect(response.status).toBe(201);

  return response.body;
}

async function createSession(params: {
  tenantId: string;
  accessToken: string;
  movieId: string;
  roomId: string;
  startsAt?: string;
  endsAt?: string;
}) {
  const response = await request(app.server)
    .post("/sessions")
    .set("Authorization", `Bearer ${params.accessToken}`)
    .set("x-tenant-id", params.tenantId)
    .send({
      movieId: params.movieId,
      roomId: params.roomId,
      startsAt: params.startsAt ?? "2026-04-20T18:00:00Z",
      endsAt: params.endsAt ?? "2026-04-20T20:30:00Z",
    });

  expect(response.status).toBe(201);

  return response.body;
}

describe("session-seats routes", () => {
  beforeAll(async () => {
    originalTmdbApiKey = process.env.TMDB_API_KEY;
    process.env.TMDB_API_KEY = "test-tmdb-key";

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (originalTmdbApiKey === undefined) {
      delete process.env.TMDB_API_KEY;
    } else {
      process.env.TMDB_API_KEY = originalTmdbApiKey;
    }

    vi.restoreAllMocks();
    await app.close();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list session seats with canonical ordering and summary", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("session-seats-list");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Mixed Layout Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
    });

    const response = await request(app.server)
      .get(`/sessions/${session.id}/seats`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      sessionId: session.id,
      summary: {
        total: 3,
        available: 3,
        blocked: 0,
        reserved: 0,
      },
    });
    expect(response.body.seats).toEqual([
      {
        id: expect.any(String),
        seatKey: "A-1",
        rowLabel: "A",
        seatNumber: 1,
        seatType: "STANDARD",
        status: "AVAILABLE",
        isAccessibilitySeat: false,
      },
      {
        id: expect.any(String),
        seatKey: "A-3",
        rowLabel: "A",
        seatNumber: 3,
        seatType: "STANDARD",
        status: "AVAILABLE",
        isAccessibilitySeat: false,
      },
      {
        id: expect.any(String),
        seatKey: "B-1",
        rowLabel: "B",
        seatNumber: 1,
        seatType: "STANDARD",
        status: "AVAILABLE",
        isAccessibilitySeat: false,
      },
    ]);
  });

  it("should return summary counts by status", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("session-seats-summary");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Summary Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-21T18:00:00Z",
      endsAt: "2026-04-21T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    await db
      .update(catalogSessionSeats)
      .set({ status: "BLOCKED" })
      .where(eq(catalogSessionSeats.id, sessionSeats[0].id));

    await db
      .update(catalogSessionSeats)
      .set({ status: "RESERVED" })
      .where(eq(catalogSessionSeats.id, sessionSeats[1].id));

    const response = await request(app.server)
      .get(`/sessions/${session.id}/seats`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(response.status).toBe(200);
    expect(response.body.summary).toEqual({
      total: 3,
      available: 1,
      blocked: 1,
      reserved: 1,
    });
  });

  it("should isolate session seat map by tenant", async () => {
    mockMovieCatalog();

    const tenantA = await createTenantAndLoginOwner("session-seats-tenant-a");
    const tenantB = await createTenantAndLoginOwner("session-seats-tenant-b");
    const room = await createRoomWithSeatLayout(tenantA, buildMixedSeatLayout(), "Tenant A Room");
    const movieId = await importMovie(tenantA);
    const session = await createSession({
      tenantId: tenantA.tenantId,
      accessToken: tenantA.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-22T18:00:00Z",
      endsAt: "2026-04-22T20:30:00Z",
    });

    const response = await request(app.server)
      .get(`/sessions/${session.id}/seats`)
      .set("Authorization", `Bearer ${tenantB.accessToken}`)
      .set("x-tenant-id", tenantB.tenantId);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Session not found");
  });

  it("should allow staff to block and unblock a session seat", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("session-seats-block-staff");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Block Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-23T18:00:00Z",
      endsAt: "2026-04-23T20:30:00Z",
    });
    const staffEmail = `staff-${Date.now()}@cine.com`;

    await createMember({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      email: staffEmail,
      role: Role.STAFF,
    });

    const staffAccessToken = await login(staffEmail);

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const blockResponse = await request(app.server)
      .patch(`/sessions/${session.id}/seats/${seat.id}/block`)
      .set("Authorization", `Bearer ${staffAccessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(blockResponse.status).toBe(200);
    expect(blockResponse.body.status).toBe("BLOCKED");

    const unblockResponse = await request(app.server)
      .patch(`/sessions/${session.id}/seats/${seat.id}/unblock`)
      .set("Authorization", `Bearer ${staffAccessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(unblockResponse.status).toBe(200);
    expect(unblockResponse.body.status).toBe("AVAILABLE");
  });

  it("should reject invalid block and unblock transitions", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("session-seats-transitions");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Transitions Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-24T18:00:00Z",
      endsAt: "2026-04-24T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    await db
      .update(catalogSessionSeats)
      .set({ status: "RESERVED" })
      .where(eq(catalogSessionSeats.id, sessionSeats[0].id));

    const blockReservedResponse = await request(app.server)
      .patch(`/sessions/${session.id}/seats/${sessionSeats[0].id}/block`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(blockReservedResponse.status).toBe(409);
    expect(blockReservedResponse.body.message).toBe("Only AVAILABLE seats can be blocked");

    const unblockAvailableResponse = await request(app.server)
      .patch(`/sessions/${session.id}/seats/${sessionSeats[1].id}/unblock`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(unblockAvailableResponse.status).toBe(409);
    expect(unblockAvailableResponse.body.message).toBe("Only BLOCKED seats can be unblocked");
  });

  it("should reject blocking a seat from another tenant session", async () => {
    mockMovieCatalog();

    const tenantA = await createTenantAndLoginOwner("session-seats-block-tenant-a");
    const tenantB = await createTenantAndLoginOwner("session-seats-block-tenant-b");
    const room = await createRoomWithSeatLayout(tenantA, buildMixedSeatLayout(), "Tenant A Block Room");
    const movieId = await importMovie(tenantA);
    const session = await createSession({
      tenantId: tenantA.tenantId,
      accessToken: tenantA.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-25T18:00:00Z",
      endsAt: "2026-04-25T20:30:00Z",
    });

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const response = await request(app.server)
      .patch(`/sessions/${session.id}/seats/${seat.id}/block`)
      .set("Authorization", `Bearer ${tenantB.accessToken}`)
      .set("x-tenant-id", tenantB.tenantId);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Session not found");
  });

  it("should forbid viewer from blocking a session seat", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("session-seats-viewer");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Viewer Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-26T18:00:00Z",
      endsAt: "2026-04-26T20:30:00Z",
    });
    const viewerEmail = `viewer-${Date.now()}@cine.com`;

    await createMember({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      email: viewerEmail,
      role: Role.VIEWER,
    });

    const viewerAccessToken = await login(viewerEmail);

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const response = await request(app.server)
      .patch(`/sessions/${session.id}/seats/${seat.id}/block`)
      .set("Authorization", `Bearer ${viewerAccessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(response.status).toBe(403);
  });

  it("should return 404 when seat is not found inside the session", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("session-seats-seat-not-found");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Seat Not Found Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-27T18:00:00Z",
      endsAt: "2026-04-27T20:30:00Z",
    });

    const response = await request(app.server)
      .patch(`/sessions/${session.id}/seats/00000000-0000-0000-0000-000000000000/block`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Session seat not found");
  });
});
