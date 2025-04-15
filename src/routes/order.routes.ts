import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, orderController.getOrders);
router.get("/:id", authenticate, orderController.getOrderById);
router.post("/", authenticate, orderController.createOrder);
router.put("/:id", authenticate, orderController.updateOrder);
router.delete("/:id", authenticate, orderController.deleteOrder);

export default router;
