import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
  process.env.LOG_LEVEL = "silent";
});

describe("Transaction Endpoints - Auth Required", () => {
  describe("All transaction routes should require auth", () => {
    const routes = [
      { method: "post", path: "/api/transactions", body: { merchant: "Test", category: "Food", kind: "expense", amount: 50 } },
      { method: "get", path: "/api/transactions" },
      { method: "get", path: "/api/transactions/some-id" },
      { method: "put", path: "/api/transactions/some-id", body: { merchant: "Updated" } },
      { method: "delete", path: "/api/transactions/some-id" },
      { method: "get", path: "/api/transactions/dashboard" },
    ];

    for (const route of routes) {
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
