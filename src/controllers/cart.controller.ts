import { cartService } from "../services/cart.service";

export const cartController = {
  addProductToCart: async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartService.addProductToCart({
        userId: req.user.id,
        productId,
        quantity,
      });
      res.status(201).json({ message: "Product added to cart", cart });
    } catch (error) {
      next(error);
    }
  },
  getCart: async (req, res, next) => {
    try {
      const cart = await cartService.getCart(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  },
  removeProductFromCart: async (req, res, next) => {
    try {
      const cart = await cartService.removeProductFromCart(
        req.user.id,
        req.params.id
      );
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  },
  updateProductToCart: async (req, res, next) => {
    try {
      const cart = await cartService.updateProductToCart(
        req.user.id,
        req.params.id,
        req.body.quantity
      );
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  },
  clearCart: async (req, res, next) => {
    try {
      const cart = await cartService.clearCart(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  },
};
export default cartController;
