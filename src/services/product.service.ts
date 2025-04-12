import { validate } from "class-validator";
import { Product } from "../entity/Product";
import { productRepo } from "../repositories/product.repo";
import { AppError } from "../helpers/AppError";

export const productService = {
  addProduct: async (productBody) => {
    try {
      const { name, description, price, category, image } = productBody;

      const product = new Product();
      product.name = name;
      product.description = description;
      product.price = price;
      product.category = category;
      product.image = image;

      const errors = await validate(product);
      if (errors.length > 0) {
        // You can include error details if needed
        const validationMessages = errors
          .map((err) => Object.values(err.constraints))
          .flat();
        throw new AppError(
          `Validation failed: ${validationMessages.join(", ")}`,
          400
        );
      }

      const existingProduct = await productRepo.findOneBy({ name });
      if (existingProduct) {
        throw new AppError("Product already exists!", 400);
      }

      const savedProduct = await productRepo.save(product);
      return savedProduct;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        console.error("Unexpected error:", error);
        throw new AppError("Error saving product", 500);
      }
    }
  },
  getProducts: async () => {
    try {
      const products = await productRepo.find();
      if (!products) {
        throw new AppError("No products found", 404);
      }
      return products;
    } catch (error) {
      console.error("Unexpected error:", error);
      throw new AppError("Error retrieving products", 500);
    }
  },
  getProduct: async (id) => {
    try {
      const product = await productRepo.findOneBy({ id });
      if (!product) {
        throw new AppError("Product not found", 404);
      }
      return product;
    } catch (error) {
      console.error("Unexpected error:", error);
      throw new AppError("Error retrieving product", 500);
    }
  },
  updateProduct: async (id, productBody) => {
    try {
      const product = await productRepo.findOneBy({ id });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const { name, description, price, category, image } = productBody;

      product.name = name;
      product.description = description;
      product.price = price;
      product.category = category;
      product.image = image;

      const errors = await validate(product);
      if (errors.length > 0) {
        // You can include error details if needed
        const validationMessages = errors
          .map((err) => Object.values(err.constraints))
          .flat();
        throw new AppError(
          `Validation failed: ${validationMessages.join(", ")}`,
          400
        );
      }

      const updatedProduct = await productRepo.save(product);
      return updatedProduct;
    } catch (error) {
      console.error("Unexpected error:", error);
      throw new AppError("Error updating product", 500);
    }
  },
  deleteProduct: async (id) => {
    try {
      const product = await productRepo.findOneBy({ id });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      await productRepo.delete(id);
      return { message: "Product deleted successfully" };
    } catch (error) {
      console.error("Unexpected error:", error);
      throw new AppError("Error deleting product", 500);
    }
  },
};
