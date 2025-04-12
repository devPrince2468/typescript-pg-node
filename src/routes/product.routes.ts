import { Router } from "express";
import productController from "../controllers/product.controller";

const router = Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.post("/", productController.addProduct);
router.delete("/:id", productController.deleteProduct);
router.put("/:id", productController.updateProduct);

export default router;
