import { Router } from "express";
import userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/", authenticate, userController.getUsers);

export default router;
