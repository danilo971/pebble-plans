import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

describe("Environment Configuration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset env
    for (const key of Object.keys(process.env)) {
      if (!key.startsWith("ORIGINAL_")) delete process.env[key];
    }
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
    process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
  });

  afterEach(() => {
    // Restore original env
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it("should validate required env vars", async () => {
    vi.resetModules();
    const { getEnv } = await import("../config/env.js");

    const env = getEnv();

    expect(env.NODE_ENV).toBe("test");
    expect(env.DATABASE_URL).toBe("postgresql://test:test@localhost:5432/test");
    expect(env.JWT_SECRET).toBe("test-jwt-secret-at-least-32-characters");
    expect(env.ACCESS_TOKEN_EXPIRES_IN).toBe("15m");
    expect(env.REFRESH_TOKEN_EXPIRES_IN).toBe("7d");
    expect(env.CORS_ORIGIN).toBe("http://localhost:5173");
  });

  it("should return defaults for test mode when JWT_SECRET is short", async () => {
    vi.resetModules();

    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
    process.env.JWT_SECRET = "short";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";

    // In test mode, getEnv should return defaults instead of calling exit
    const { getEnv } = await import("../config/env.js");
    const env = getEnv();

    // Should have fallen back to test defaults
    expect(env.NODE_ENV).toBe("test");
    expect(env.JWT_SECRET).toBe("test-jwt-secret-at-least-32-characters");
  });

  it("should validate JWT_SECRET in production mode", async () => {
    vi.resetModules();

    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
    process.env.JWT_SECRET = "short";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });

    try {
      const { getEnv } = await import("../config/env.js");
      getEnv();
    } catch (e: any) {
      expect(e.message).toBe("exit");
    }

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("should parse rate limit env vars as numbers", async () => {
    vi.resetModules();

    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
    process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
    process.env.RATE_LIMIT_WINDOW_MS = "60000";
    process.env.RATE_LIMIT_MAX_REQUESTS = "50";

    const { getEnv } = await import("../config/env.js");
    const env = getEnv();

    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(50);
  });
});
