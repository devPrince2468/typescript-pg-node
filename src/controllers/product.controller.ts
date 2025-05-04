import { plainToInstance } from "class-transformer";
import { productService } from "../services/product.service";
import { Product } from "../entities/Product";
import { validate } from "class-validator";

export const productController = {
  addProduct: async (req, res, next) => {
    try {
      const { body } = req;

      const response = await productService.addProduct({
        ...body,
        image: body.cloudinaryResult.secure_url,
      });
      res.status(201).json({
        message: "Product added successfully",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  },
  getProducts: async (req, res, next) => {
    try {
      const products = await productService.getProducts();
      res.status(200).json({
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },
  getProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await productService.getProduct(id);
      res.status(200).json({
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;

      let image = req.body.image
        ? req.body.image
        : req.body.cloudinaryResult.secure_url;

      const productData = { ...req.body, image: image };

      // If there's no file in the request, preserve the old image
      if (!req.file) {
        const existingProduct = await productService.getProduct(id);
        productData.image = existingProduct.image; // Preserve old image if no new image uploaded
      }

      console.log("File:", req.file);
      console.log("Body:", productData);

      const response = await productService.updateProduct(id, productData);
      res.status(200).json({
        message: "Product updated successfully",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const response = await productService.deleteProduct(id);
      res.status(200).json({
        message: "Product deleted successfully",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  },
};
export default productController;
