import { AppError } from "../helpers/AppError";
import { cartRepo } from "../repositories/cart.repo";
import { cartItemRepo } from "../repositories/cartItem.repo";
import { userRepo } from "../repositories/user.repo";
import { productService } from "./product.service";

export const cartService = {
  addProductToCart: async ({ userId, productId, quantity }) => {
    const user = await userRepo.findOne({
      where: { id: Number(userId) },
      relations: ["cart", "cart.items"],
    });
    if (!user) throw new AppError("User not found", 404);

    let cart = user.cart;
    if (!cart) {
      cart = cartRepo.create({ user });
      await cartRepo.save(cart);
    }

    const product = await productService.getProductByIdService(productId);
    if (!product) throw new AppError("Product not found", 404);

    if (product.available < quantity) {
      throw new AppError("Insufficient stock available", 400);
    }

    let cartItem = await cartItemRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + Number(quantity);
      if (product.available < newQuantity - cartItem.quantity) {
        const productForTotalCheck = await productService.getProductByIdService(
          productId
        );
        if (productForTotalCheck.available < newQuantity) {
          throw new AppError(
            "Insufficient stock available for the updated total quantity in cart",
            400
          );
        }
      }
      cartItem.quantity = newQuantity;
    } else {
      cartItem = cartItemRepo.create({
        cart,
        product,
        quantity: Number(quantity),
      });
    }

    await cartItemRepo.save(cartItem);

    const updatedCart = await cartService.getCart(userId);
    return updatedCart;
  },

  getCart: async (userId) => {
    const user = await userRepo.findOne({
      where: { id: Number(userId) },
      relations: ["cart", "cart.items", "cart.items.product"],
    });
    if (!user) throw new AppError("User not found", 404);
    if (!user.cart)
      return { id: null, userId: Number(userId), items: [], totalAmount: 0 };

    let totalAmount = 0;
    const items = user.cart.items.map((item) => {
      const itemTotal = item.product.price * item.quantity;
      totalAmount += itemTotal;
      return {
        cartItemId: item.id,
        productId: item.product.id,
        productName: item.product.title,
        productPrice: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        availableStock: item.product.available,
        itemTotal,
      };
    });
    return { id: user.cart.id, userId: Number(userId), items, totalAmount };
  },

  removeProductFromCart: async (userId, cartItemId: number) => {
    const user = await userRepo.findOne({
      where: { id: Number(userId) },
      relations: ["cart"],
    });
    if (!user || !user.cart) throw new AppError("User or cart not found", 404);

    const cartItem = await cartItemRepo.findOne({
      where: { id: cartItemId, cart: { id: user.cart.id } },
      relations: ["product"],
    });
    if (!cartItem) throw new AppError("Product not found in cart", 404);

    await cartItemRepo.remove(cartItem);

    const updatedCart = await cartService.getCart(userId);
    return updatedCart;
  },

  updateProductInCart: async (userId, cartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      return cartService.removeProductFromCart(userId, cartItemId);
    }

    const user = await userRepo.findOne({
      where: { id: Number(userId) },
      relations: ["cart"],
    });
    if (!user || !user.cart) throw new AppError("User or cart not found", 404);

    const cartItem = await cartItemRepo.findOne({
      where: { id: cartItemId, cart: { id: user.cart.id } },
      relations: ["product"],
    });
    if (!cartItem) throw new AppError("Product not found in cart", 404);

    const product = await productService.getProductByIdService(
      cartItem.product.id
    );
    if (!product) throw new AppError("Product data not found", 404);

    if (product.available < quantity) {
      throw new AppError(
        "Insufficient stock available for the updated quantity",
        400
      );
    }

    cartItem.quantity = Number(quantity);
    await cartItemRepo.save(cartItem);

    const updatedCart = await cartService.getCart(userId);
    return updatedCart;
  },

  clearCart: async (userId) => {
    const user = await userRepo.findOne({
      where: { id: Number(userId) },
      relations: ["cart", "cart.items", "cart.items.product"],
    });
    if (!user || !user.cart || user.cart.items.length === 0) {
      return { message: "Cart is already empty or not found" };
    }

    await cartItemRepo.delete({ cart: { id: user.cart.id } });

    return { message: "Cart cleared successfully" };
  },
};
