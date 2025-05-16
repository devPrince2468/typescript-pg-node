import { CartItem } from "../entities/CartItem";
import { Product } from "../entities/Product";
import { AppError } from "../helpers/AppError";
import { cartRepo } from "../repositories/cart.repo";
import { cartItemRepo } from "../repositories/cartItem.repo";
import { productRepo } from "../repositories/product.repo";
import { userRepo } from "../repositories/user.repo";

export const cartService = {
  addProductToCart: async ({ userId, productId, quantity }) => {
    // 1. Check if the user exists
    const user = await userRepo.findOne({
      where: { id: Number(userId) },
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

    // 4. Check if the product has sufficient stock
    if (product.stock < quantity) {
      throw new AppError("Insufficient stock available", 400);
    }

    // 5. Check if the product is already in the cart
    let cartItem = await cartItemRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    // 6. If the product is already in the cart, update the quantity
    if (cartItem) {
      const newQuantity = cartItem.quantity + Number(quantity);
      if (product.stock < newQuantity) {
        throw new AppError(
          "Insufficient stock available for the updated quantity",
          400
        );
      }
      cartItem.quantity = newQuantity; // Increment the quantity
    } else {
      // 7. If the product is not in the cart, create a new cart item
      cartItem = cartItemRepo.create({
        cart,
        product,
        quantity,
      });
    }

    // 8. Deduct the reserved quantity from the product stock
    product.stock -= quantity;
    await productRepo.save(product);

    // 9. Save the cart item to the database
    await cartItemRepo.save(cartItem);

    // 10. Return the updated cart item
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

    // Restore the product stock
    const product = await productRepo.findOneBy({ id: productId });
    if (product) {
      product.stock += cartItem.quantity;
      await productRepo.save(product);
    }

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

    const product = await productRepo.findOneBy({ id: productId });
    if (!product) throw new AppError("Product not found", 404);

    const quantityDifference = quantity - cartItem.quantity;

    if (quantityDifference > 0 && product.stock < quantityDifference) {
      throw new AppError(
        "Insufficient stock available for the updated quantity",
        400
      );
    }

    // Update product stock
    product.stock -= quantityDifference;
    await productRepo.save(product);

    cartItem.quantity = Number(quantity);
    await cartItemRepo.save(cartItem);

    return cartItem;
  },
  clearCart: async (userId) => {
    // Fetch user with cart and items
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["cart", "cart.items", "cart.items.product"],
    });

    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      throw new AppError("User not found", 404);
    }

    if (!user.cart || !user.cart.items || user.cart.items.length === 0) {
      console.log(`Cart is empty or not found for user: ${user.id}`);
      return { message: "Cart is already empty" };
    }

    // Use a transaction to ensure atomicity
    try {
      await userRepo.manager.transaction(async (transactionalEntityManager) => {
        const productRepoTx = transactionalEntityManager.getRepository(Product);
        const cartItemRepoTx =
          transactionalEntityManager.getRepository(CartItem);

        // Update product stock
        for (const item of user.cart.items) {
          console.log(
            `Processing cart item: Product ID ${item.product.id}, Quantity ${item.quantity}`
          );
          const product = await productRepoTx.findOne({
            where: { id: item.product.id },
          });

          if (!product) {
            console.error(`Product not found: ${item.product.id}`);
            throw new AppError(`Product not found: ${item.product.id}`, 404);
          }

          product.stock += item.quantity;
          await productRepoTx.save(product);
          console.log(
            `Updated product stock: Product ID ${product.id}, New Stock ${product.stock}`
          );
        }

        // Delete cart items
        const deleteResult = await cartItemRepoTx.delete({
          cart: { id: user.cart.id },
        });
        console.log(
          `Cart items deleted: Affected rows ${deleteResult.affected}`
        );
      });

      return { message: "Cart cleared successfully" };
    } catch (error) {
      console.error(`Error clearing cart for user ${userId}:`, error);
      throw error instanceof AppError
        ? error
        : new AppError("Failed to clear cart", 500);
    }
  },
};
