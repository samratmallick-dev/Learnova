import { StatusCodes } from "http-status-codes";

class ApiResponse {
      constructor(
            statusCode = StatusCodes.OK,
            message = "Success",
            data = null
      ) {
            this.success = statusCode < 400;
            this.statusCode = statusCode;
            this.message = message;
            this.data = data;
      }

      static success(message = "Success", data = null) {
            return new ApiResponse(StatusCodes.OK, message, data);
      }

      static created(message = "Created", data = null) {
            return new ApiResponse(StatusCodes.CREATED, message, data);
      }

      static noContent(message = "No Content") {
            return new ApiResponse(StatusCodes.NO_CONTENT, message, null);
      }

      send(res) {
            return res.status(this.statusCode).json({
                  success: this.success,
                  message: this.message,
                  data: this.data,
            });
      }
}

export default ApiResponse;