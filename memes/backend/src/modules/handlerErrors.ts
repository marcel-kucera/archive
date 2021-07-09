import { INVALIDREASON, ValidationResult } from "./validation";

export interface HandlerError {
  status: number;
  message: string;
  error?: Error;
}

//User errors
export function invalidFormError(validationError: ValidationResult) {
  return errorBuilder(
    400,
    `${validationError.field} ${validationError.reason}`
  );
}

export function notFoundError(resource: string) {
  return errorBuilder(404, `${resource} not found`);
}

export function wrongDatatypeError() {
  return errorBuilder(400, "upload has invalid datatype");
}

//Auth errors
export function userAuthError() {
  return errorBuilder(401, "wrong username or password");
}

export function tokenInvalidError() {
  return errorBuilder(401, "auth token is invalid");
}

export function duplicateUsernameError() {
  return errorBuilder(400, "username is already taken");
}

//Server errors
export function databaseError(error: Error) {
  let message = "server error";
  return errorBuilder(500, message, error);
}

export function unknownError(error: Error) {
  let message = "unknown error";
  return errorBuilder(500, message, error);
}

//Generic handler error builder
export function errorBuilder(
  status: number,
  message: string,
  error?: Error
): HandlerError {
  let err: HandlerError = { status: status, message: message };
  if (error) {
    err.error = error;
  }
  return err;
}
