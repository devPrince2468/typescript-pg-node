import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { AppError } from "../helpers/AppError";
import { orderRepo } from "../repositories/order.repo";
import { productRepo } from "../repositories/product.repo";
import { userRepo } from "../repositories/user.repo";
import { productService } from "./product.service";
import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import { Product } from "../entities/Product";
import { CartItem } from "../entities/CartItem";

interface OrderItemData {
  productId: number;
  quantity: number;
  price: number;
}

export const orderService = {
  getOrders: async (userId) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);

    const orders = await orderRepo.find({
      where: { user: { id: userId } },
      relations: ["items", "items.product", "user"],
      order: { createdAt: "DESC" },
    });
    return orders;
  },
  getOrderById: async (userId, orderId) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);

    const order = await orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ["items", "items.product", "user"],
    });
    if (!order) throw new AppError("Order not found", 404);

    return order;
  },
  createOrderFromCart: async (userId: number): Promise<Order> => {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: userId },
        relations: ["cart", "cart.items", "cart.items.product"],
      });

      if (!user) throw new AppError("User not found", 404);
      if (!user.cart || !user.cart.items || user.cart.items.length === 0) {
        throw new AppError("Cart is empty, cannot create order", 400);
      }

      // 1. Prepare OrderItems and update Product stock
      const newOrderItems: OrderItem[] = [];
      let calculatedTotalPrice = 0;

      for (const cartItem of user.cart.items) {
        const product = await transactionalEntityManager.findOne(Product, {
          where: { id: cartItem.product.id },
        });
        if (!product)
          throw new AppError(
            `Product with ID ${cartItem.product.id} not found.`,
            404
          );

        if (product.available < cartItem.quantity) {
          throw new AppError(
            `Insufficient stock for product: ${product.title}. Available: ${product.available}, Requested: ${cartItem.quantity}`,
            400
          );
        }

        // Update product stock
        product.stock -= cartItem.quantity;
        // The Product entity's @BeforeUpdate hook will recalculate `available`.
        // We save the product change immediately within the transaction.
        await transactionalEntityManager.save(Product, product);

        const orderItem = transactionalEntityManager.create(OrderItem, {
          // `order` will be set later once the Order entity instance is created
          product: product,
          quantity: cartItem.quantity,
          price: product.price, // Use current product price at time of order
        });
        newOrderItems.push(orderItem);
        calculatedTotalPrice += orderItem.price * orderItem.quantity;
      }

      // 2. Create and save the Order with its items
      const order = transactionalEntityManager.create(Order, {
        user: user,
        items: newOrderItems, // Assign the fully prepared OrderItem instances
        totalPrice: calculatedTotalPrice,
        status: "PENDING",
      });

      // Set the reverse relation from OrderItem back to Order
      for (const item of newOrderItems) {
        item.order = order;
      }

      const savedOrder = await transactionalEntityManager.save(Order, order); // This should cascade save newOrderItems

      // 3. Clear the user's cart
      // We need to get fresh cart items to remove, as they are instances managed by the EM
      const cartItemsToRemove = await transactionalEntityManager.find(
        CartItem,
        {
          where: { cart: { id: user.cart.id } },
        }
      );
      if (cartItemsToRemove.length > 0) {
        await transactionalEntityManager.remove(cartItemsToRemove);
      }
      // Optionally remove the cart itself or disassociate from user if it's single-use.
      // user.cart = null; await transactionalEntityManager.save(User, user);

      return savedOrder;
    });
  },
  updateOrder: async (userId, orderId, orderData) => {
    // Logic to update an existing order for a user
    return {};
  },
  deleteOrder: async (userId, orderId) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);
    const order = await orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ["items", "items.product"],
    });
    console.log("Deleting order", order);
    if (!order) throw new AppError("Order not found", 404);
    await orderRepo.remove(order);
    return { message: "Order deleted successfully" };
  },
  updateOrderStatus: async (
    orderId: number,
    status: string
  ): Promise<Order> => {
    const order = await orderRepo.findOneBy({ id: orderId });
    if (!order) throw new AppError("Order not found", 404);

    order.status = status;
    return await orderRepo.save(order);
  },
};
