import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { IHourRequestService } from "../services/interfaces/IHourRequestService";
import { ApiResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/errorHandler";

@injectable()
export class HourRequestController {
  constructor(
    @inject(TYPES.HourRequestService)
    private readonly hourRequestService: IHourRequestService,
  ) {}

  submitRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const requestData = req.body;

    await this.hourRequestService.submitHourRequest(userId, requestData);

    ApiResponseHandler.success(res, "Hour request submitted successfully");
  });

  approveRequest = asyncHandler(async (req: Request, res: Response) => {
    const requestId = parseInt(req.params.requestId);

    const hourRequest =
      await this.hourRequestService.approveHourRequest(requestId);

    ApiResponseHandler.success(
      res,
      hourRequest,
      "Hour request approved successfully",
    );
  });

  rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const requestId = parseInt(req.params.requestId);

    const hourRequest =
      await this.hourRequestService.rejectHourRequest(requestId);

    ApiResponseHandler.success(
      res,
      hourRequest,
      "Hour request rejected successfully",
    );
  });

  getPendingRequests = asyncHandler(async (_req: Request, res: Response) => {
    const pendingRequests = await this.hourRequestService.getPendingRequests();

    ApiResponseHandler.success(
      res,
      pendingRequests,
      "Pending hour requests retrieved successfully",
    );
  });

  getUserRequests = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);

    const userRequests = await this.hourRequestService.getUserRequests(userId);

    ApiResponseHandler.success(
      res,
      userRequests,
      "User hour requests retrieved successfully",
    );
  });
}
