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
    return {
      userId,
      productId,
      quantity: cartItem.quantity,
      product: {
        id: product.id,
        name: product.title,
        price: product.price,
      },
    };
  },
  getCart: async (userId) => {
    // Logic to get the cart for a user
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["cart", "cart.items", "cart.items.product"],
    });
    if (!user) throw new AppError("User not found", 404);

    if (!user.cart) return { items: [] };

    const cartItems = user.cart.items.map((item) => ({
      productId: item.product.id,
      productName: item.product.title,
      productPrice: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    return cartItems;
  },
  removeProductFromCart: async (userId, productId) => {
    // Logic to remove a product from the cart for a user
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["cart", "cart.items"],
    });
    if (!user) throw new AppError("User not found", 404);

    const cartItem = await cartItemRepo.findOne({
      where: { cart: { id: user.cart.id }, product: { id: productId } },
    });
    if (!cartItem) throw new AppError("Product not found in cart", 404);

    await cartItemRepo.remove(cartItem);

    return { message: "Product removed from cart" };
  },
  updateProductToCart: async (userId, productId, quantity) => {
    console.log("Updating product in cart", userId, productId, quantity);
    // Logic to update the quantity of a product in the cart for a user
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["cart", "cart.items"],
    });
    if (!user) throw new AppError("User not found", 404);

    const cartItem = await cartItemRepo.findOne({
      where: { cart: { id: user.cart.id }, product: { id: productId } },
    });
    if (!cartItem) throw new AppError("Product not found in cart", 404);

    cartItem.quantity = Number(quantity);
    await cartItemRepo.save(cartItem);

    return cartItem;
  },
  clearCart: async (userId) => {
    // Logic to clear the cart for a user
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["cart", "cart.items"],
    });
    if (!user) throw new AppError("User not found", 404);

    if (user.cart) {
      await cartItemRepo.delete({ cart: { id: user.cart.id } });
    }

    return { message: "Cart cleared" };
  },
};
