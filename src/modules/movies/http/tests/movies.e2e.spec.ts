import type { FastifyInstance } from "fastify";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { buildApp } from "src/http/app";

let app: FastifyInstance;
let originalTmdbApiKey: string | undefined;

type AuthContext = {
  tenantId: string;
  accessToken: string;
};

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function createTenantAndLogin(emailPrefix: string): Promise<AuthContext> {
  const timestamp = Date.now();
  const email = `${emailPrefix}-${timestamp}@cine.com`;

  const tenantResponse = await request(app.server)
    .post("/tenants")
    .send({
      tenantName: `Cinema ${emailPrefix}`,
      tenantSlug: `${emailPrefix}-${timestamp}`,
      ownerEmail: email,
      ownerPassword: "password123",
    });

  expect(tenantResponse.status).toBe(201);

  const loginResponse = await request(app.server).post("/auth/login").send({
    email,
    password: "password123",
  });

  expect(loginResponse.status).toBe(200);

  return {
    tenantId: (loginResponse.body.defaultTenantId ??
      loginResponse.body.memberships?.[0]?.tenantId) as string,
    accessToken: loginResponse.body.accessToken as string,
  };
}

describe("movies routes", () => {
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

  it("should search movies from the external provider", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      expect(url).toContain("/search/movie");
      expect(url).toContain("query=batman");

      return createJsonResponse({
        page: 1,
        total_pages: 2,
        results: [
          {
            id: 603,
            title: "The Matrix",
            original_title: "The Matrix",
            overview: "Neo discovers the truth.",
            poster_path: "/matrix-poster.jpg",
            backdrop_path: "/matrix-backdrop.jpg",
            release_date: "1999-03-31",
          },
        ],
      });
    });

    const auth = await createTenantAndLogin("movies-search");

    const response = await request(app.server)
      .get("/movies/search")
      .query({ query: "batman" })
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("x-tenant-id", auth.tenantId);

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.totalPages).toBe(2);
    expect(response.body.items).toEqual([
      {
        sourceProvider: "TMDB",
        sourceMovieId: "603",
        title: "The Matrix",
        originalTitle: "The Matrix",
        synopsis: "Neo discovers the truth.",
        posterUrl: "https://image.tmdb.org/t/p/w500/matrix-poster.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/w1280/matrix-backdrop.jpg",
        releaseDate: "1999-03-31",
      },
    ]);
  });

  it("should avoid duplicate imports for the same tenant", async () => {
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
          genres: [{ id: 878, name: "Science Fiction" }],
          original_language: "en",
          popularity: 95.4,
          vote_average: 8.2,
          vote_count: 25000,
        });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    const auth = await createTenantAndLogin("movies-import");

    const firstImport = await request(app.server)
      .post("/movies/import")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("x-tenant-id", auth.tenantId)
      .send({
        sourceProvider: "TMDB",
        sourceMovieId: "603",
      });

    expect(firstImport.status).toBe(201);
    expect(firstImport.body.imported).toBe(true);
    expect(firstImport.body.movieId).toBeTruthy();

    const secondImport = await request(app.server)
      .post("/movies/import")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("x-tenant-id", auth.tenantId)
      .send({
        sourceProvider: "TMDB",
        sourceMovieId: "603",
      });

    expect(secondImport.status).toBe(200);
    expect(secondImport.body).toEqual({
      movieId: firstImport.body.movieId,
      imported: false,
    });

    const listResponse = await request(app.server)
      .get("/movies")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("x-tenant-id", auth.tenantId);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      id: firstImport.body.movieId,
      tenantId: auth.tenantId,
      title: "The Matrix",
      runtimeMinutes: 136,
      sourceProvider: "TMDB",
      sourceMovieId: "603",
    });
  });

  it("should isolate imported movies by tenant", async () => {
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

    const tenantA = await createTenantAndLogin("movies-tenant-a");
    const tenantB = await createTenantAndLogin("movies-tenant-b");

    const tenantAImport = await request(app.server)
      .post("/movies/import")
      .set("Authorization", `Bearer ${tenantA.accessToken}`)
      .set("x-tenant-id", tenantA.tenantId)
      .send({ sourceProvider: "TMDB", sourceMovieId: "603" });

    const tenantBImport = await request(app.server)
      .post("/movies/import")
      .set("Authorization", `Bearer ${tenantB.accessToken}`)
      .set("x-tenant-id", tenantB.tenantId)
      .send({ sourceProvider: "TMDB", sourceMovieId: "550" });

    expect(tenantAImport.status).toBe(201);
    expect(tenantBImport.status).toBe(201);

    const tenantAList = await request(app.server)
      .get("/movies")
      .set("Authorization", `Bearer ${tenantA.accessToken}`)
      .set("x-tenant-id", tenantA.tenantId);

    const tenantBList = await request(app.server)
      .get("/movies")
      .set("Authorization", `Bearer ${tenantB.accessToken}`)
      .set("x-tenant-id", tenantB.tenantId);

    expect(tenantAList.status).toBe(200);
    expect(tenantBList.status).toBe(200);
    expect(tenantAList.body).toHaveLength(1);
    expect(tenantBList.body).toHaveLength(1);
    expect(tenantAList.body[0].title).toBe("The Matrix");
    expect(tenantBList.body[0].title).toBe("Fight Club");
  });
});
