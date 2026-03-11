import { StatusCodes } from "http-status-codes";

class ApiError extends Error {
      constructor(
            message = "Internal Server Error",
            statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
            explanation = null,
            errors = []
      ) {
            super(message);

            this.name = "ApiError";
            this.statusCode = statusCode;
            this.explanation = explanation || message;
            this.errors = errors;
            this.success = false;
            this.isOperational = true;

            Error.captureStackTrace(this, this.constructor);
      }

      static badRequest(message = "Bad Request", errors = []) {
            return new ApiError(message, StatusCodes.BAD_REQUEST, message, errors);
      }

      static unauthorized(message = "Unauthorized") {
            return new ApiError(message, StatusCodes.UNAUTHORIZED);
      }

      static forbidden(message = "Forbidden") {
            return new ApiError(message, StatusCodes.FORBIDDEN);
      }

      static notFound(message = "Resource not found") {
            return new ApiError(message, StatusCodes.NOT_FOUND);
      }

      static conflict(message = "Conflict") {
            return new ApiError(message, StatusCodes.CONFLICT);
      }

      static unprocessableEntity(message = "Validation Error", errors = []) {
            return new ApiError(
                  message,
                  StatusCodes.UNPROCESSABLE_ENTITY,
                  message,
                  errors
            );
      }

      static internal(message = "Internal Server Error") {
            return new ApiError(message, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      static serviceUnavailable(message = "Service unavailable") {
            return new ApiError(message, StatusCodes.SERVICE_UNAVAILABLE);
      }

      toJSON() {
            return {
                  success: false,
                  statusCode: this.statusCode,
                  message: this.message,
                  explanation: this.explanation,
                  errors: this.errors,
                  stack:
                        process.env.NODE_ENV === "development"
                              ? this.stack
                              : undefined,
            };
      }
}

export default ApiError;