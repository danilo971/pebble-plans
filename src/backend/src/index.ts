import "dotenv/config";
import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";
import { logger } from "./config/logger.js";
import { testDbConnection, closeDb } from "./db/connection.js";

async function start(): Promise<void> {
  const env = getEnv();
  const app = createApp();

  // Test database connection
  const dbOk = await testDbConnection();
  if (!dbOk) {
    logger.error("Não foi possível conectar ao banco de dados. Verifique DATABASE_URL.");
    process.exit(1);
  }
  logger.info("Banco de dados conectado com sucesso.");

  const server = app.listen(env.PORT, () => {
    logger.info(`Backend rodando em http://localhost:${env.PORT}`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} recebido. Encerrando servidor...`);
    server.close(async () => {
      await closeDb();
      logger.info("Servidor encerrado com sucesso.");
      process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
      logger.error("Shutdown forçado após timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  logger.fatal(err, "Falha ao iniciar o servidor.");
  process.exit(1);
});
