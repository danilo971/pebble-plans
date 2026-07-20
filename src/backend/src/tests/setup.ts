import { beforeAll, afterAll, afterEach } from "vitest";
import { createApp } from "../app.js";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

// Mock the database module for tests
import * as connection from "../db/connection.js";

// Override getDb to use in-memory mock
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Override before each test
beforeAll(() => {
  // Override env for tests
  process.env.NODE_ENV = "test";
  process.env.PORT = "0";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
  process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
  process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";
  process.env.CORS_ORIGIN = "http://localhost:5173";
  process.env.LOG_LEVEL = "silent";
});

afterEach(() => {
  vi.clearAllMocks();
});

/**
 * Generate a valid JWT token for test users
 */
export function generateToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign(user, "test-jwt-secret-at-least-32-characters", { expiresIn: "15m" });
}

/**
 * Create a supertest agent for the app
 */
export function createTestClient() {
  const app = createApp();
  return request(app);
}

/**
 * Helper to create an authenticated request
 */
export function authRequest(user: { id: string; email: string; name: string }) {
  const token = generateToken(user);
  return {
    token,
    authHeader: `Bearer ${token}`,
  };
}

// Export vitest globals re-export
export { beforeAll, afterAll, afterEach, describe, it, expect, vi } from "vitest";
