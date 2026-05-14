import { and, eq, inArray } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { buildApp } from "src/http/app";
import { Role } from "src/modules/iam/domain/role";
import { db } from "src/shared/db/client";
import {
  catalogReservationSeats,
  catalogReservations,
  catalogSessionSeats,
} from "src/shared/db/schema";

let app: FastifyInstance;
let originalTmdbApiKey: string | undefined;

function buildMixedSeatLayout() {
  return {
    rows: [
      {
        label: "A",
        seats: [
          { number: 1, type: "STANDARD" as const, active: true },
          { number: 2, type: "STANDARD" as const, active: true },
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

async function createReservationHold(params: {
  tenantId: string;
  accessToken: string;
  sessionId: string;
  seatIds: string[];
}) {
  const response = await request(app.server)
    .post(`/sessions/${params.sessionId}/reservations`)
    .set("Authorization", `Bearer ${params.accessToken}`)
    .set("x-tenant-id", params.tenantId)
    .send({ seatIds: params.seatIds });

  expect(response.status).toBe(201);

  return response.body as {
    reservationId: string;
    sessionId: string;
    status: string;
    expiresAt: string;
    seatCount: number;
    seats: Array<{ id: string; seatKey: string }>;
  };
}

describe("reservations routes", () => {
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

  it("should create a hold reservation for available seats", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-create");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Reservations Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const targetSeats = sessionSeats.slice(0, 2);

    const response = await request(app.server)
      .post(`/sessions/${session.id}/reservations`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({ seatIds: targetSeats.map((seat) => seat.id) });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      reservationId: expect.any(String),
      sessionId: session.id,
      status: "HOLD",
      seatCount: 2,
      seats: [
        { id: targetSeats[0].id, seatKey: targetSeats[0].seatKey },
        { id: targetSeats[1].id, seatKey: targetSeats[1].seatKey },
      ],
    });
    expect(new Date(response.body.expiresAt).toString()).not.toBe("Invalid Date");

    const [reservation] = await db
      .select()
      .from(catalogReservations)
      .where(eq(catalogReservations.id, response.body.reservationId));

    expect(reservation).toMatchObject({
      tenantId: owner.tenantId,
      sessionId: session.id,
      status: "HOLD",
    });

    const reservationSeats = await db
      .select()
      .from(catalogReservationSeats)
      .where(eq(catalogReservationSeats.reservationId, reservation.id));

    expect(reservationSeats).toHaveLength(2);

    const heldSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(inArray(catalogSessionSeats.id, targetSeats.map((seat) => seat.id)));

    expect(new Set(heldSeats.map((seat) => seat.status))).toEqual(new Set(["HELD"]));
  });

  it("should reject reserving a blocked seat", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-blocked");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Blocked Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-21T18:00:00Z",
      endsAt: "2026-04-21T20:30:00Z",
    });

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    await db
      .update(catalogSessionSeats)
      .set({ status: "BLOCKED" })
      .where(eq(catalogSessionSeats.id, seat.id));

    const response = await request(app.server)
      .post(`/sessions/${session.id}/reservations`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({ seatIds: [seat.id] });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Only AVAILABLE seats can be reserved");
  });

  it("should reject duplicate seat ids in payload", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-duplicate-seats");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Duplicate Seat Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-22T18:00:00Z",
      endsAt: "2026-04-22T20:30:00Z",
    });

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const response = await request(app.server)
      .post(`/sessions/${session.id}/reservations`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({ seatIds: [seat.id, seat.id] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Seat ids must be unique");
  });

  it("should forbid viewer from creating a reservation hold", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-viewer");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Viewer Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-23T18:00:00Z",
      endsAt: "2026-04-23T20:30:00Z",
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
      .post(`/sessions/${session.id}/reservations`)
      .set("Authorization", `Bearer ${viewerAccessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({ seatIds: [seat.id] });

    expect(response.status).toBe(403);
  });

  it("should allow only one concurrent hold for the same seat", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-concurrency");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Concurrency Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-24T18:00:00Z",
      endsAt: "2026-04-24T20:30:00Z",
    });

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const [firstResponse, secondResponse] = await Promise.all([
      request(app.server)
        .post(`/sessions/${session.id}/reservations`)
        .set("Authorization", `Bearer ${owner.accessToken}`)
        .set("x-tenant-id", owner.tenantId)
        .send({ seatIds: [seat.id] }),
      request(app.server)
        .post(`/sessions/${session.id}/reservations`)
        .set("Authorization", `Bearer ${owner.accessToken}`)
        .set("x-tenant-id", owner.tenantId)
        .send({ seatIds: [seat.id] }),
    ]);

    const statuses = [firstResponse.status, secondResponse.status].sort();

    expect(statuses).toEqual([201, 409]);

    const reservations = await db
      .select()
      .from(catalogReservations)
      .where(
        and(
          eq(catalogReservations.tenantId, owner.tenantId),
          eq(catalogReservations.sessionId, session.id),
        ),
      );

    expect(reservations).toHaveLength(1);

    const updatedSeat = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.id, seat.id));

    expect(updatedSeat[0].status).toBe("HELD");
  });

  it("should confirm a hold reservation and reserve its seats", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-confirm");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Confirm Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-25T18:00:00Z",
      endsAt: "2026-04-25T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const hold = await createReservationHold({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      sessionId: session.id,
      seatIds: sessionSeats.slice(0, 2).map((seat) => seat.id),
    });

    const response = await request(app.server)
      .post(`/reservations/${hold.reservationId}/confirm`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      reservationId: hold.reservationId,
      sessionId: session.id,
      status: "CONFIRMED",
      seatCount: 2,
    });

    const [reservation] = await db
      .select()
      .from(catalogReservations)
      .where(eq(catalogReservations.id, hold.reservationId));

    expect(reservation.status).toBe("CONFIRMED");

    const reservedSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(inArray(catalogSessionSeats.id, hold.seats.map((seat) => seat.id)));

    expect(new Set(reservedSeats.map((seat) => seat.status))).toEqual(new Set(["RESERVED"]));
  });

  it("should cancel a hold reservation and release its seats", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-cancel");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Cancel Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-26T18:00:00Z",
      endsAt: "2026-04-26T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const hold = await createReservationHold({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      sessionId: session.id,
      seatIds: sessionSeats.slice(0, 2).map((seat) => seat.id),
    });

    const response = await request(app.server)
      .post(`/reservations/${hold.reservationId}/cancel`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      reservationId: hold.reservationId,
      sessionId: session.id,
      status: "CANCELLED",
      seatCount: 2,
    });

    const [reservation] = await db
      .select()
      .from(catalogReservations)
      .where(eq(catalogReservations.id, hold.reservationId));

    expect(reservation.status).toBe("CANCELLED");

    const availableSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(inArray(catalogSessionSeats.id, hold.seats.map((seat) => seat.id)));

    expect(new Set(availableSeats.map((seat) => seat.status))).toEqual(new Set(["AVAILABLE"]));
  });

  it("should reject cancelling a confirmed reservation", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-cancel-confirmed");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Cancel Confirmed Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-27T18:00:00Z",
      endsAt: "2026-04-27T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const hold = await createReservationHold({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      sessionId: session.id,
      seatIds: [sessionSeats[0].id],
    });

    const confirmResponse = await request(app.server)
      .post(`/reservations/${hold.reservationId}/confirm`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(confirmResponse.status).toBe(200);

    const cancelResponse = await request(app.server)
      .post(`/reservations/${hold.reservationId}/cancel`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(cancelResponse.status).toBe(409);
    expect(cancelResponse.body.message).toBe("Only HOLD reservations can be cancelled");
  });

  it("should reject confirming a cancelled reservation", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-confirm-cancelled");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Confirm Cancelled Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-28T18:00:00Z",
      endsAt: "2026-04-28T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const hold = await createReservationHold({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      sessionId: session.id,
      seatIds: [sessionSeats[0].id],
    });

    const cancelResponse = await request(app.server)
      .post(`/reservations/${hold.reservationId}/cancel`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(cancelResponse.status).toBe(200);

    const confirmResponse = await request(app.server)
      .post(`/reservations/${hold.reservationId}/confirm`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(confirmResponse.status).toBe(409);
    expect(confirmResponse.body.message).toBe("Only HOLD reservations can be confirmed");
  });

  it("should expire a hold lazily when confirming after expiration", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-expire-confirm");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Expire Confirm Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-29T18:00:00Z",
      endsAt: "2026-04-29T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const hold = await createReservationHold({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      sessionId: session.id,
      seatIds: [sessionSeats[0].id],
    });

    await db
      .update(catalogReservations)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(catalogReservations.id, hold.reservationId));

    const confirmResponse = await request(app.server)
      .post(`/reservations/${hold.reservationId}/confirm`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(confirmResponse.status).toBe(409);
    expect(confirmResponse.body.message).toBe("Reservation hold expired");

    const [reservation] = await db
      .select()
      .from(catalogReservations)
      .where(eq(catalogReservations.id, hold.reservationId));

    expect(reservation.status).toBe("EXPIRED");

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.id, hold.seats[0].id));

    expect(seat.status).toBe("AVAILABLE");
  });

  it("should release an expired hold lazily and allow a new reservation", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-expire-reuse");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Expire Reuse Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-04-30T18:00:00Z",
      endsAt: "2026-04-30T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const firstHold = await createReservationHold({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      sessionId: session.id,
      seatIds: [sessionSeats[0].id],
    });

    await db
      .update(catalogReservations)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(catalogReservations.id, firstHold.reservationId));

    const secondResponse = await request(app.server)
      .post(`/sessions/${session.id}/reservations`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId)
      .send({ seatIds: [sessionSeats[0].id] });

    expect(secondResponse.status).toBe(201);
    expect(secondResponse.body.reservationId).not.toBe(firstHold.reservationId);

    const [firstReservation] = await db
      .select()
      .from(catalogReservations)
      .where(eq(catalogReservations.id, firstHold.reservationId));

    expect(firstReservation.status).toBe("EXPIRED");

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.id, sessionSeats[0].id));

    expect(seat.status).toBe("HELD");
  });

  it("should get a reservation with its seats", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-get");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Get Reservation Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-05-01T18:00:00Z",
      endsAt: "2026-05-01T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const hold = await createReservationHold({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      sessionId: session.id,
      seatIds: sessionSeats.slice(0, 2).map((seat) => seat.id),
    });

    const response = await request(app.server)
      .get(`/reservations/${hold.reservationId}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      reservationId: hold.reservationId,
      sessionId: session.id,
      status: "HOLD",
      seatCount: 2,
    });
    expect(response.body.seats).toEqual(expect.arrayContaining(hold.seats));
  });

  it("should return an expired reservation status lazily on read", async () => {
    mockMovieCatalog();

    const owner = await createTenantAndLoginOwner("reservations-get-expired");
    const room = await createRoomWithSeatLayout(owner, buildMixedSeatLayout(), "Get Expired Room");
    const movieId = await importMovie(owner);
    const session = await createSession({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      movieId,
      roomId: room.id,
      startsAt: "2026-05-02T18:00:00Z",
      endsAt: "2026-05-02T20:30:00Z",
    });

    const sessionSeats = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.sessionId, session.id));

    const hold = await createReservationHold({
      tenantId: owner.tenantId,
      accessToken: owner.accessToken,
      sessionId: session.id,
      seatIds: [sessionSeats[0].id],
    });

    await db
      .update(catalogReservations)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(catalogReservations.id, hold.reservationId));

    const response = await request(app.server)
      .get(`/reservations/${hold.reservationId}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .set("x-tenant-id", owner.tenantId);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("EXPIRED");

    const [seat] = await db
      .select()
      .from(catalogSessionSeats)
      .where(eq(catalogSessionSeats.id, hold.seats[0].id));

    expect(seat.status).toBe("AVAILABLE");
  });
});
