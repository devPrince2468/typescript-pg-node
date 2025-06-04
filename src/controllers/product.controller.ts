import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";
import { AuthenticatedRequest } from "../middleware/auth"; // Assuming you have this for user info
import { AppError } from "../helpers/AppError";

export default {
  addProduct: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { title, description, price, category, stock } = req.body;
      const image = req.body.cloudinaryResult?.secure_url; // Assuming image URL comes from cloudinary middleware

      if (!image) {
        throw new AppError("Image upload failed or image URL not found", 400);
      }

      const createProductDto = {
        title,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock, 10),
        image,
      };

      const product = await productService.createProductService(
        createProductDto
      );
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId)) {
        throw new AppError("Invalid product ID", 400);
      }

      const { title, description, price, category, stock } = req.body;
      const image = req.body.cloudinaryResult?.secure_url; // Image update is optional

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (price) updateData.price = parseFloat(price);
      if (category) updateData.category = category;
      if (stock !== undefined) updateData.stock = parseInt(stock, 10);
      if (image) updateData.image = image; // Only update image if a new one was uploaded

      if (Object.keys(updateData).length === 0) {
        throw new AppError("No update data provided", 400);
      }

      const updatedProduct = await productService.updateProductService(
        productId,
        updateData
      );
      res.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  },

  getProducts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await productService.getAllProductsService();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  getProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId)) {
        throw new AppError("Invalid product ID", 400);
      }
      const product = await productService.getProductByIdService(productId);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId)) {
        throw new AppError("Invalid product ID", 400);
      }
      await productService.deleteProductService(productId);
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};
