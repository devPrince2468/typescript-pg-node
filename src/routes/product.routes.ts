import { Router } from "express";
import productController from "../controllers/product.controller";
import { uploadSingle } from "../middleware/multer";

const router = Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.post("/", uploadSingle, productController.addProduct);
router.delete("/:id", productController.deleteProduct);
router.put("/:id", uploadSingle, productController.updateProduct);

export default router;
