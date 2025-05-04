import { Router } from "express";
import userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { uploadSingle } from "../middleware/multer";
import { uploadImageToCloudinary } from "../middleware/uploadImageToCloudinary";

const router = Router();

router.post(
  "/register",
  uploadSingle,
  uploadImageToCloudinary,
  userController.register
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/", authenticate, userController.getUsers);

export default router;
