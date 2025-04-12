import { Router } from "express";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/product", productRoutes);

export default router;
