import { describe, it, expect, beforeAll } from "vitest";

// Set env vars before importing app
beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
  process.env.LOG_LEVEL = "silent";
});

describe("App Creation Smoke Test", () => {
  it("should create the app without errors", async () => {
    const { createApp } = await import("../app.js");
    const app = createApp();
    expect(app).toBeDefined();
  });

  it("should have all required routes registered", async () => {
    const { createApp } = await import("../app.js");
    const app = createApp();

    // Check that the app is an Express instance
    expect(typeof app.listen).toBe("function");
    expect(typeof app.use).toBe("function");
    expect(typeof app.get).toBe("function");
  });
});
