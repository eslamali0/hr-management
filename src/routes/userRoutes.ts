import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../config/types";
import { UserController } from "../controllers/UserController";
import { validateCreateUser } from "../middleware/validation/userValidation";
import { isAuthenticated, isAdmin } from "../middleware/auth";

export const createUserRoutes = (container: Container) => {
  const router = Router();
  const userController = container.get<UserController>(TYPES.UserController);

  router.get("/departments", isAuthenticated, userController.getDepartments);

  router.post(
    "/",
    isAuthenticated,
    isAdmin,
    validateCreateUser,
    userController.createUser,
  );
  router.get("/", isAuthenticated, isAdmin, userController.getAllUsers);
  router.get("/:id", isAuthenticated, isAdmin, userController.findById);
  router.get(
    "/email/:email",
    isAuthenticated,
    isAdmin,
    userController.findByEmail,
  );

  return router;
};
