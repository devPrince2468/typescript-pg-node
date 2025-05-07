import { Router } from "express";
import cartController from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, cartController.getCart);
router.post("/", authenticate, cartController.addProductToCart);
router.post("/clearCart", authenticate, cartController.clearCart);
router.put("/:id", authenticate, cartController.updateProductToCart);
router.delete("/:id", authenticate, cartController.removeProductFromCart);

export default router;
