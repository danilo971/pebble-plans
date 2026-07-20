export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "CONFLICT"
  | "BUSINESS_RULE_VIOLATION"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string[];
}

export class AppException extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: string[];

  constructor(code: ErrorCode, statusCode: number, message: string, details?: string[]) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppException";
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export function validationError(message: string, details?: string[]): AppException {
  return new AppException("VALIDATION_ERROR", 400, message, details);
}

export function authError(message = "Não autorizado"): AppException {
  return new AppException("AUTHENTICATION_ERROR", 401, message);
}

export function forbiddenError(message = "Acesso negado"): AppException {
  return new AppException("AUTHORIZATION_ERROR", 403, message);
}

export function notFoundError(resource: string): AppException {
  return new AppException("RESOURCE_NOT_FOUND", 404, `${resource} não encontrado(a).`);
}

export function conflictError(message: string): AppException {
  return new AppException("CONFLICT", 409, message);
}

export function businessError(message: string): AppException {
  return new AppException("BUSINESS_RULE_VIOLATION", 422, message);
}

export function internalError(message = "Erro interno do servidor"): AppException {
  return new AppException("INTERNAL_ERROR", 500, message);
}
