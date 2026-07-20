import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
  process.env.LOG_LEVEL = "silent";
});

describe("All Protected Endpoints Without Auth", () => {
  const protectedRoutes = [
    { method: "post", path: "/api/transactions", body: { merchant: "Test", category: "Food", kind: "expense", amount: 50 } },
    { method: "get", path: "/api/transactions" },
    { method: "get", path: "/api/transactions/some-id" },
    { method: "put", path: "/api/transactions/some-id", body: { merchant: "Updated" } },
    { method: "delete", path: "/api/transactions/some-id" },
    { method: "get", path: "/api/transactions/dashboard" },
    { method: "post", path: "/api/cards", body: { name: "Test", brand: "Visa", last4: "1234", limit: 5000, dueDay: 15 } },
    { method: "get", path: "/api/cards" },
    { method: "get", path: "/api/cards/some-id" },
    { method: "put", path: "/api/cards/some-id", body: { name: "Updated" } },
    { method: "delete", path: "/api/cards/some-id" },
    { method: "post", path: "/api/accounts", body: { name: "Test", kind: "Conta corrente" } },
    { method: "get", path: "/api/accounts" },
    { method: "get", path: "/api/accounts/some-id" },
    { method: "put", path: "/api/accounts/some-id", body: { name: "Updated" } },
    { method: "delete", path: "/api/accounts/some-id" },
    { method: "post", path: "/api/goals", body: { title: "Test", target: 1000 } },
    { method: "get", path: "/api/goals" },
    { method: "get", path: "/api/goals/some-id" },
    { method: "put", path: "/api/goals/some-id", body: { title: "Updated" } },
    { method: "delete", path: "/api/goals/some-id" },
    { method: "post", path: "/api/categories", body: { name: "Test", limit: 500 } },
    { method: "get", path: "/api/categories" },
    { method: "get", path: "/api/categories/some-id" },
    { method: "put", path: "/api/categories/some-id", body: { name: "Updated" } },
    { method: "delete", path: "/api/categories/some-id" },
    { method: "get", path: "/api/auth/me" },
    { method: "put", path: "/api/auth/me", body: { name: "Updated" } },
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
