import { describe, it, expect } from "vitest";
import {
  AppException,
  validationError,
  authError,
  forbiddenError,
  notFoundError,
  conflictError,
  businessError,
  internalError,
} from "../utils/errors.js";

describe("AppException", () => {
  it("should create an error with correct properties", () => {
    const err = new AppException("VALIDATION_ERROR", 400, "Campo obrigatório");
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Campo obrigatório");
    expect(err.name).toBe("AppException");
    expect(err instanceof Error).toBe(true);
  });

  it("should serialize to JSON correctly", () => {
    const err = new AppException("VALIDATION_ERROR", 400, "Campo obrigatório", ["name é obrigatório"]);
    const json = err.toJSON();
    expect(json).toEqual({
      code: "VALIDATION_ERROR",
      message: "Campo obrigatório",
      details: ["name é obrigatório"],
    });
  });
});

describe("Factory functions", () => {
  it("validationError creates 400 error", () => {
    const err = validationError("Dados inválidos", ["field1"]);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual(["field1"]);
  });

  it("authError creates 401 error", () => {
    const err = authError("Token inválido");
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("AUTHENTICATION_ERROR");
  });

  it("authError uses default message", () => {
    const err = authError();
    expect(err.message).toBe("Não autorizado");
  });

  it("forbiddenError creates 403 error", () => {
    const err = forbiddenError("Sem permissão");
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("AUTHORIZATION_ERROR");
  });

  it("notFoundError creates 404 error with resource name", () => {
    const err = notFoundError("Transação");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Transação não encontrado(a).");
  });

  it("conflictError creates 409 error", () => {
    const err = conflictError("Já existe");
    expect(err.statusCode).toBe(409);
  });

  it("businessError creates 422 error", () => {
    const err = businessError("Regra violada");
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("BUSINESS_RULE_VIOLATION");
  });

  it("internalError creates 500 error", () => {
    const err = internalError();
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("Erro interno do servidor");
  });
});
