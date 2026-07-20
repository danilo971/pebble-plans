import { describe, it, expect, vi, beforeAll } from "vitest";

beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
  process.env.LOG_LEVEL = "silent";
});

// Mock the database connection
vi.mock("../db/connection.js", () => {
  const mockInsert = vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        passwordHash: "hashed",
        avatarInitials: "TU",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]),
    }),
    returning: vi.fn().mockResolvedValue([{
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed",
      avatarInitials: "TU",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]),
  });

  const mockSelect = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        passwordHash: "$2a$12$validhash",
        avatarInitials: "TU",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]),
    }),
  });

  return {
    getDb: vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              id: "test-user-id",
              name: "Test User",
              email: "test@example.com",
              passwordHash: "hashed",
              avatarInitials: "TU",
              createdAt: new Date(),
              updatedAt: new Date(),
            }]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    testDbConnection: vi.fn().mockResolvedValue(true),
    users: { id: {}, email: {}, name: {}, passwordHash: {} },
    refreshTokens: { id: {}, userId: {}, token: {}, expiresAt: {}, revokedAt: {} },
    transactions: { id: {}, userId: {}, merchant: {}, category: {}, kind: {}, amount: {} },
    cards: { id: {}, userId: {}, name: {} },
    accounts: { id: {}, userId: {}, name: {} },
    goals: { id: {}, userId: {}, title: {} },
    categories: { id: {}, userId: {}, name: {} },
  };
});

describe("Auth Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should return 400 when fields are missing", async () => {
      const { createApp } = await import("../app.js");
      const request = (await import("supertest")).default;
      const app = createApp();

      const res = await request(app)
        .post("/api/auth/register")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for short password", async () => {
      const { createApp } = await import("../app.js");
      const request = (await import("supertest")).default;
      const app = createApp();

      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "test@example.com", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("8 caracteres");
    });

    it("should return 400 for invalid email", async () => {
      const { createApp } = await import("../app.js");
      const request = (await import("supertest")).default;
      const app = createApp();

      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "invalid", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("E-mail inválido");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 when fields are missing", async () => {
      const { createApp } = await import("../app.js");
      const request = (await import("supertest")).default;
      const app = createApp();

      const res = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should return 400 when token is missing", async () => {
      const { createApp } = await import("../app.js");
      const request = (await import("supertest")).default;
      const app = createApp();

      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("Protected routes without auth", () => {
    const protectedRoutes = [
      { method: "get", path: "/api/auth/me" },
      { method: "put", path: "/api/auth/me", body: { name: "New Name" } },
      { method: "get", path: "/api/transactions" },
      { method: "get", path: "/api/cards" },
      { method: "get", path: "/api/accounts" },
      { method: "get", path: "/api/goals" },
      { method: "get", path: "/api/categories" },
    ];

    for (const route of protectedRoutes) {
      it(`${route.method.toUpperCase()} ${route.path} should return 401 without auth`, async () => {
        const { createApp } = await import("../app.js");
        const request = (await import("supertest")).default;
        const app = createApp();

        const res = await request(app)[route.method](route.path).send(route.body || {});
        expect(res.status).toBe(401);
      });
    }
  });
});
