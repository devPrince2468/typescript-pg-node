import { Router } from "express";
import productController from "../controllers/product.controller";
import { uploadSingle } from "../middleware/multer";
import { uploadImageToCloudinary } from "../middleware/uploadImageToCloudinary";

const router = Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.post(
  "/",
  uploadSingle,
  uploadImageToCloudinary,
  productController.addProduct
);
router.delete("/:id", productController.deleteProduct);
router.put(
  "/:id",
  uploadSingle,
  uploadImageToCloudinary,
  productController.updateProduct
);

export default router;
