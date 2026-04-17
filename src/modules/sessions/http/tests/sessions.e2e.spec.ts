import type { FastifyInstance } from "fastify";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { buildApp } from "src/http/app";
import { Role } from "src/modules/iam/domain/role";

let app: FastifyInstance;
let originalTmdbApiKey: string | undefined;

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

    if (url.includes("/movie/550")) {
      return createJsonResponse({
        id: 550,
        title: "Fight Club",
        original_title: "Fight Club",
        overview: "An insomniac meets Tyler Durden.",
        poster_path: "/fight-club-poster.jpg",
        backdrop_path: "/fight-club-backdrop.jpg",
        release_date: "1999-10-15",
        runtime: 139,
        genres: [],
        original_language: "en",
        popularity: 80.1,
        vote_average: 8.4,
        vote_count: 22000,
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

async function createRoom(auth: { tenantId: string; accessToken: string }, name = "Room 1") {
  const response = await request(app.server)
    .post("/rooms")
    .set("Authorization", `Bearer ${auth.accessToken}`)
    .set("x-tenant-id", auth.tenantId)
    .send({
      name,
      seatLayout: buildSeatLayout(),
    });

  expect(response.status).toBe(201);

  return response.body;
}

describe("sessions routes", () => {
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

  it("should allow staff to create a session with room snapshot", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("sessions-staff");
    const room = await createRoom(owner, "Blue Room");
    const movieId = await importMovie(owner);
    const staffEmail = `staff-${Date.now()}@cine.com`;

    await createMember({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      email: staffEmail,
      role: Role.STAFF,
    });

    const staffAccessToken = await login(staffEmail);

    const response = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${staffAccessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T18:00:00Z",
        endsAt: "2026-04-20T20:30:00Z",
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      tenantId: owner.tenantId,
      movieId,
      roomId: room.id,
      status: "SCHEDULED",
    });
    expect(response.body.roomLayoutSnapshot).toEqual(room.seatLayout);
  });

  it("should reject session creation when movie belongs to another tenant", async () => {
    mockMovieCatalog();

    const tenantA = await createTenantAndLoginOwner("sessions-movie-a");
    const tenantB = await createTenantAndLoginOwner("sessions-movie-b");
    const room = await createRoom(tenantA, "Room A");
    const movieId = await importMovie(tenantB);

    const response = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${tenantA.accessToken}`)
      .set("x-tenant-id", tenantA.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T18:00:00Z",
        endsAt: "2026-04-20T20:30:00Z",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Movie not found");
  });

  it("should reject session creation when room belongs to another tenant", async () => {
    mockMovieCatalog();

    const tenantA = await createTenantAndLoginOwner("sessions-room-a");
    const tenantB = await createTenantAndLoginOwner("sessions-room-b");
    const room = await createRoom(tenantB, "Room B");
    const movieId = await importMovie(tenantA);

    const response = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${tenantA.accessToken}`)
      .set("x-tenant-id", tenantA.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T18:00:00Z",
        endsAt: "2026-04-20T20:30:00Z",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Room not found");
  });

  it("should reject invalid time windows", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("sessions-invalid-window");
    const room = await createRoom(owner, "Room 1");
    const movieId = await importMovie(owner);

    const response = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T20:30:00Z",
        endsAt: "2026-04-20T18:00:00Z",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Session end time must be after start time");
  });

  it("should reject overlapping sessions and allow adjacent sessions", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("sessions-overlap");
    const room = await createRoom(owner, "Overlap Room");
    const movieId = await importMovie(owner);

    const firstSession = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T18:00:00Z",
        endsAt: "2026-04-20T20:30:00Z",
      });

    expect(firstSession.status).toBe(201);

    const overlapResponse = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T20:00:00Z",
        endsAt: "2026-04-20T22:00:00Z",
      });

    expect(overlapResponse.status).toBe(409);
    expect(overlapResponse.body.message).toBe(
      "Room already has a scheduled session in this time range",
    );

    const adjacentResponse = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T20:30:00Z",
        endsAt: "2026-04-20T22:30:00Z",
      });

    expect(adjacentResponse.status).toBe(201);
  });

  it("should list and get sessions only inside the active tenant", async () => {
    mockMovieCatalog();

    const tenantA = await createTenantAndLoginOwner("sessions-tenant-a");
    const tenantB = await createTenantAndLoginOwner("sessions-tenant-b");
    const room = await createRoom(tenantA, "Tenant A Room");
    const movieId = await importMovie(tenantA, "603");

    const createResponse = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${tenantA.accessToken}`)
      .set("x-tenant-id", tenantA.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T18:00:00Z",
        endsAt: "2026-04-20T20:30:00Z",
      });

    expect(createResponse.status).toBe(201);

    const tenantAList = await request(app.server)
      .get("/sessions")
      .set("Authorization", `Bearer ${tenantA.accessToken}`)
      .set("x-tenant-id", tenantA.tenantId);

    const tenantBList = await request(app.server)
      .get("/sessions")
      .set("Authorization", `Bearer ${tenantB.accessToken}`)
      .set("x-tenant-id", tenantB.tenantId);

    const tenantBGet = await request(app.server)
      .get(`/sessions/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${tenantB.accessToken}`)
      .set("x-tenant-id", tenantB.tenantId);

    expect(tenantAList.status).toBe(200);
    expect(tenantAList.body).toHaveLength(1);
    expect(tenantAList.body[0].id).toBe(createResponse.body.id);

    expect(tenantBList.status).toBe(200);
    expect(tenantBList.body).toHaveLength(0);

    expect(tenantBGet.status).toBe(404);
    expect(tenantBGet.body.message).toBe("Session not found");
  });

  it("should block viewers from creating sessions", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("sessions-viewer");
    const room = await createRoom(owner, "Viewer Room");
    const movieId = await importMovie(owner);
    const viewerEmail = `viewer-${Date.now()}@cine.com`;

    await createMember({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      email: viewerEmail,
      role: Role.VIEWER,
    });

    const viewerAccessToken = await login(viewerEmail);

    const response = await request(app.server)
      .post("/sessions")
      .set("Authorization", `Bearer ${viewerAccessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({
        movieId,
        roomId: room.id,
        startsAt: "2026-04-20T18:00:00Z",
        endsAt: "2026-04-20T20:30:00Z",
      });

    expect(response.status).toBe(403);
  });
});
