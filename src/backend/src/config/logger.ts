import pino from "pino";
import { getEnv } from "./env.js";

export const logger = pino({
  level: getEnv().LOG_LEVEL,
  base: { service: "pebble-plans-backend" },
  transport:
    getEnv().NODE_ENV !== "production" && getEnv().LOG_LEVEL !== "silent"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
