import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors";

export const validateUserOwnership = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestedUserId = parseInt(req.params.userId);
  const authenticatedUserId = req.user?.userId;

  if (!authenticatedUserId || requestedUserId !== authenticatedUserId) {
    throw new ForbiddenError("You can only modify your own balance");
  }

  next();
};
