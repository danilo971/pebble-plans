import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function getEnv(): Env {
  if (env) return env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const missing = Object.keys(errors).join(", ");
    console.error(`Missing or invalid environment variables: ${missing}`);
    console.error(JSON.stringify(errors, null, 2));
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    // In test mode, return defaults to avoid crash
    return {
      NODE_ENV: "test",
      PORT: 0,
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      JWT_SECRET: "test-jwt-secret-at-least-32-characters",
      ACCESS_TOKEN_EXPIRES_IN: "15m",
      REFRESH_TOKEN_SECRET: "test-refresh-secret-at-least-32-characters",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
      CORS_ORIGIN: "http://localhost:5173",
      RATE_LIMIT_WINDOW_MS: 900000,
      RATE_LIMIT_MAX_REQUESTS: 100,
      LOG_LEVEL: "silent",
      FRONTEND_URL: "http://localhost:5173",
    };
  }

  env = result.data;
  return env;
}

export function isTest(): boolean {
  return getEnv().NODE_ENV === "test";
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}
