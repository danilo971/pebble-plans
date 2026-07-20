import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
  process.env.LOG_LEVEL = "silent";
});

describe("Health Endpoints", () => {
  it("should handle health routes", async () => {
    const { createApp } = await import("../app.js");
    const request = (await import("supertest")).default;
    const app = createApp();

    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("pebble-plans-backend");
  });

  it("should handle /health/live", async () => {
    const { createApp } = await import("../app.js");
    const request = (await import("supertest")).default;
    const app = createApp();

    const res = await request(app).get("/health/live");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("alive");
  });

  it("should handle /health/ready with degraded DB", async () => {
    const { createApp } = await import("../app.js");
    const request = (await import("supertest")).default;
    const app = createApp();

    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(503);
    expect(res.body.status).toBe("degraded");
  });

  it("should handle root endpoint", async () => {
    const { createApp } = await import("../app.js");
    const request = (await import("supertest")).default;
    const app = createApp();

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.service).toBe("pebble-plans-backend");
    expect(res.body.version).toBe("1.0.0");
  });

  it("should return 404 for unknown routes", async () => {
    const { createApp } = await import("../app.js");
    const request = (await import("supertest")).default;
    const app = createApp();

    const res = await request(app).get("/unknown-route");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("RESOURCE_NOT_FOUND");
  });
});
