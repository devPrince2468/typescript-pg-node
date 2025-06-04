import { validate } from "class-validator";
import { Product } from "../entities/Product";
import { productRepo } from "../repositories/product.repo";
import { AppError } from "../helpers/AppError";
import { AppDataSource } from "../data-source";

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
}

export const productService = {
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
    await productRepository.remove(product);
  },
};
