import { validate } from "class-validator";
import { Product } from "../entities/Product";
import { productRepo } from "../repositories/product.repo";
import { AppError } from "../helpers/AppError";

export const productService = {
  addProduct: async (productBody) => {
    try {
      const {
        title,
        description,
        price,
        category,
        image,
        stock,
        reserved = 0,
      } = productBody;

      const product = new Product();
      product.title = title;
      product.description = description;
      product.price = Number(price);
      product.category = category;
      product.stock = Number(stock);
      product.reserved = Number(reserved);
      product.available = Math.max(0, product.stock - product.reserved);
      product.image = image;

      // The available field will be calculated automatically by the entity's BeforeInsert hook

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

      const existingProduct = await productRepo.findOneBy({ title });
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

      const { title, description, price, category, image, stock, reserved } =
        productBody;

      // Update product fields with the data from the request
      product.title = title;
      product.description = description;
      product.price = Number(price);
      product.category = category;

      // Update stock and reserved if provided
      if (stock !== undefined) {
        product.stock = Number(stock);
      }

      if (reserved !== undefined) {
        product.reserved = Number(reserved);
      }

      // The available field will be calculated automatically by the entity's BeforeUpdate hook

      // Update the image if provided in the request body
      product.image = image;

      const errors = await validate(product);
      if (errors.length > 0) {
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

  // New method to update stock levels
  updateStock: async (id, stockData) => {
    try {
      const product = await productRepo.findOneBy({ id });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const { stock, reserved } = stockData;

      if (stock !== undefined) {
        product.stock = Number(stock);
      }

      if (reserved !== undefined) {
        product.reserved = Number(reserved);
      }

      // The available field will be calculated automatically by the entity's BeforeUpdate hook

      const errors = await validate(product);
      if (errors.length > 0) {
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
      throw new AppError("Error updating product stock", 500);
    }
  },
};
