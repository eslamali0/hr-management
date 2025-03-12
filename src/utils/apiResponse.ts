import { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  statusCode: number;
}

export class ApiResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200,
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = "Internal Server Error",
    statusCode: number = 500,
    error?: any,
  ): Response {
    const response: ApiResponse<null> = {
      success: false,
      message,
      error,
      statusCode,
    };
    return res.status(statusCode).json(response);
  }

  static notFound(
    res: Response,
    message: string = "Resource not found",
  ): Response {
    return this.error(res, message, 404);
  }

  static badRequest(
    res: Response,
    message: string = "Bad request",
    error?: any,
  ): Response {
    return this.error(res, message, 400, error);
  }

  static unauthorized(
    res: Response,
    message: string = "Unauthorized",
  ): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = "Forbidden"): Response {
    return this.error(res, message, 403);
  }
}
