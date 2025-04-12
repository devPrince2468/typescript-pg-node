import { Router } from "express";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/product", productRoutes);
router.use("/cart", cartRoutes);

export default router;
