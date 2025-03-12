import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../config/types";
import { LeaveRequestController } from "../controllers/LeaveRequestController";
import { isAuthenticated, isAdmin, isUser } from "../middleware/auth";
import { validateLeaveRequest } from "../middleware/validation/leaveRequestValidation";

export const leaveRequestRouter = (container: Container) => {
  const router = Router();
  const leaveRequestController = container.get<LeaveRequestController>(
    TYPES.LeaveRequestController,
  );

  router.post(
    "/:userId",
    isAuthenticated,
    isUser,
    validateLeaveRequest,
    leaveRequestController.submitRequest,
  );

  router.get(
    "/pending",
    isAuthenticated,
    isAdmin,
    leaveRequestController.getPendingRequests,
  );

  router.get(
    "/user/:userId",
    isAuthenticated,
    leaveRequestController.getUserRequests,
  );

  router.patch(
    "/:requestId/approve",
    isAuthenticated,
    isAdmin,
    leaveRequestController.approveRequest,
  );

  router.patch(
    "/:requestId/reject",
    isAuthenticated,
    isAdmin,
    leaveRequestController.rejectRequest,
  );

  return router;
};
