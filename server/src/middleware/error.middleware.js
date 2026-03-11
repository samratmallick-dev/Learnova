import ApiError from "../utilities/response/api-error.js";
import ApiResponse from "../utilities/response/api-response.js";
import Logger from "../config/logger.config.js";
import { StatusCodes } from "http-status-codes";

const errorHandler = (err, req, res, next) => {
      let error = err;

      Logger.error({
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode,
            url: req.url,
            method: req.method,
            ip: req.ip,
      });

      if (err instanceof ApiError) {
            error = err;
      } else {
            if (err.name === "CastError") {
                  error = ApiError.notFound("Resource not found");
            }

            else if (err.code === 11000) {
                  error = ApiError.conflict("Duplicate field value entered");
            }

            else if (err.name === "ValidationError") {
                  const messages = Object.values(err.errors).map(val => val.message);
                  error = ApiError.unprocessableEntity("Validation Error", messages);
            }

            else if (err.name === "JsonWebTokenError") {
                  error = ApiError.unauthorized("Invalid token");
            }

            else if (err.name === "TokenExpiredError") {
                  error = ApiError.unauthorized("Token expired");
            }

            else if (err.name === "MulterError") {
                  if (err.code === "LIMIT_FILE_SIZE") {
                        error = ApiError.badRequest("File size too large. Maximum size is 5MB.");
                  }
                  else if (err.code === "LIMIT_FILE_COUNT") {
                        error = ApiError.badRequest("Too many files uploaded. Maximum is 10 files.");
                  }
                  else {
                        error = ApiError.badRequest(`File upload error: ${err.message}`);
                  }
            } else {
                  error = ApiError.internal(err.message || "Internal Server Error");
            }
      }

      const response = new ApiResponse(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            error.message,
            null
      );

      res.status(response.statusCode).json(response);
};

export default errorHandler;