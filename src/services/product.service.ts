import { validate } from "class-validator";
import { Product } from "../entities/Product";
import { productRepo } from "../repositories/product.repo";
import { AppError } from "../helpers/AppError";
import { AppDataSource } from "../data-source";

// Assuming your Product entity is in ../entities/Product
// And AppDataSource is your TypeORM data source
const productRepository = AppDataSource.getRepository(Product);

interface CreateProductData {
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number; // Admin provides the initial total stock
}

interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  stock?: number; // Admin can update total stock
  // Note: 'reserved' and 'available' are not directly updated via this general endpoint
}

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

  createProductService: async (data: CreateProductData): Promise<Product> => {
    const existingProduct = await productRepository.findOneBy({
      title: data.title,
    });
    if (existingProduct) {
      throw new AppError("Product with this title already exists", 409);
    }

    const product = productRepository.create({
      ...data,
      reserved: 0, // New products have no reservations by default
    });
    // The @BeforeInsert hook in Product.ts will calculate 'available' (stock - reserved)
    return await productRepository.save(product);
  },

  updateProductService: async (
    productId: number,
    data: UpdateProductData
  ): Promise<Product> => {
    const product = await productRepository.findOneBy({ id: productId });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Preserve existing reserved quantity, only update fields provided in data
    const currentReserved = product.reserved;

    // Update stock if provided by admin
    let newStock = product.stock;
    if (data.stock !== undefined) {
      if (data.stock < 0) {
        throw new AppError("Stock cannot be negative", 400);
      }
      // Business rule: If an admin reduces stock below current reservations, it's an issue.
      // For this general update, we'll allow it, and `available` will become 0 or negative (if not for Math.max in hook).
      // A more advanced system might block this or trigger alerts/processes.
      // The hook `available = Math.max(0, this.stock - this.reserved)` will prevent negative available.
      newStock = data.stock;
    }

    // Merge other updatable fields
    productRepository.merge(product, {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      stock: newStock, // Apply the new stock value
      // DO NOT directly assign data.reserved here.
    });

    // Ensure reserved is not accidentally overwritten if not part of merge logic directly
    product.reserved = currentReserved;

    // The @BeforeUpdate hook in Product.ts will recalculate 'available' based on the new stock and existing reserved quantity.
    return await productRepository.save(product);
  },

  getAllProductsService: async (): Promise<Product[]> => {
    const products = await productRepository.find();
    if (!products) {
      throw new AppError("No products found", 404);
    }
    return products;
  },

  getProductByIdService: async (productId: number): Promise<Product | null> => {
    const product = await productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  },

  deleteProductService: async (productId: number): Promise<void> => {
    const product = await productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new AppError("Product not found to delete", 404);
    }
    // Consider if there are related entities or business rules before deleting (e.g., existing orders with this product)
    await productRepository.remove(product);
  },

  // --- Stock/Reservation methods (to be called by Cart/Order services) ---

  /**
   * Reserves a certain quantity of a product.
   * To be called when items are added to cart (if cart reservation is enabled)
   * or when an order is initiated (pending payment).
   */
  reserveStockService: async (
    productId: number,
    quantityToReserve: number
  ): Promise<Product> => {
    const product = await productRepository.findOneBy({ id: productId });
    if (!product) throw new AppError("Product not found for reservation", 404);

    if (product.available < quantityToReserve) {
      throw new AppError("Not enough available stock to reserve", 400);
    }

    product.reserved += quantityToReserve;
    // @BeforeUpdate hook will update product.available
    return await productRepository.save(product);
  },

  /**
   * Releases a certain quantity of reserved product stock.
   * To be called when items are removed from cart (if cart reservation was enabled),
   * or if a pending order is cancelled/fails.
   */
  releaseStockService: async (
    productId: number,
    quantityToRelease: number
  ): Promise<Product> => {
    const product = await productRepository.findOneBy({ id: productId });
    if (!product)
      throw new AppError("Product not found for stock release", 404);

    product.reserved = Math.max(0, product.reserved - quantityToRelease);
    // @BeforeUpdate hook will update product.available
    return await productRepository.save(product);
  },

  /**
   * Finalizes a sale by deducting stock.
   * To be called when an order is successfully paid and confirmed.
   */
  deductStockService: async (
    productId: number,
    quantitySold: number
  ): Promise<Product> => {
    const product = await productRepository.findOneBy({ id: productId });
    if (!product)
      throw new AppError("Product not found for stock deduction", 404);

    // This check should ideally happen *before* payment attempt, but good to have defense here.
    if (product.available < quantitySold) {
      // This means reservations might not have worked correctly or stock changed.
      throw new AppError(
        "Critical error: Not enough available stock to fulfill order after confirmation.",
        500
      );
    }
    if (product.stock < quantitySold) {
      throw new AppError(
        "Critical error: Not enough total stock to fulfill order.",
        500
      );
    }

    product.stock -= quantitySold;
    // If items were reserved for this sale, the reservation is now fulfilled.
    product.reserved = Math.max(0, product.reserved - quantitySold);
    // @BeforeUpdate hook will update product.available
    return await productRepository.save(product);
  },
};
