import { AppError } from "../helpers/AppError";
import { cartRepo } from "../repositories/cart.repo";
import { cartItemRepo } from "../repositories/cartItem.repo";
import { productRepo } from "../repositories/product.repo";
import { userRepo } from "../repositories/user.repo";

export const cartService = {
  addProductToCart: async ({ userId, productId, quantity }) => {
    // 1. Check if the user exists
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["cart", "cart.items"],
    });
    if (!user) throw new AppError("User not found", 404);

    let cart = user.cart;

    // 2. If the user does not have a cart, create a new cart
    if (!cart) {
      cart = cartRepo.create({ user });
      await cartRepo.save(cart);
    }

    // 3. Check if the product exists
    const product = await productRepo.findOneBy({ id: productId });
    if (!product) throw new AppError("Product not found", 404);

    // 4. Check if the product is already in the cart
    let cartItem = await cartItemRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    // 5. If the product is already in the cart, update the quantity
    if (cartItem) {
      cartItem.quantity += Number(quantity); // Increment the quantity
    } else {
      // 6. If the product is not in the cart, create a new cart item
      cartItem = cartItemRepo.create({
        cart,
        product,
        quantity,
      });
    }

    // 7. Save the cart item to the database
    await cartItemRepo.save(cartItem);

    // 8. Return the updated cart item
    return { userId, productId, quantity };
  },
  getCart: async (userId) => {
    // Logic to get the cart for a user
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["cart", "cart.items", "cart.items.product"],
    });
    if (!user) throw new AppError("User not found", 404);

    return user.cart;
  },
  removeProductFromCart: async (userId, productId) => {
    // Logic to remove a product from the cart for a user
    return [];
  },
  updateProductToCart: async (userId, productId, quantity) => {
    // Logic to update the quantity of a product in the cart for a user
    return [];
  },
};
