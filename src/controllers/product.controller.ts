import { productService } from "../services/product.service";

export const productController = {
  addProduct: async (req, res, next) => {
    try {
      const productData = req.body;
      const response = await productService.addProduct(productData);
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
      const productData = req.body;
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
