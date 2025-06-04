import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { AppError } from "../helpers/AppError";
import { orderRepo } from "../repositories/order.repo";
import { userRepo } from "../repositories/user.repo";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Product } from "../entities/Product";
import { CartItem } from "../entities/CartItem";

export const orderService = {
  getOrders: async (userId) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);

    const orders = await orderRepo.find({
      where: { user: { id: userId } },
      relations: ["items", "items.product"],
      order: { createdAt: "DESC" },
    });
    return orders;
  },
  getOrderById: async (userId, orderId) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);

    const order = await orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ["items", "items.product"],
    });
    if (!order) throw new AppError("Order not found", 404);

    return order;
  },
  createOrder: async (userId: number): Promise<Order> => {
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

        await transactionalEntityManager.save(Product, product);

        const orderItem = transactionalEntityManager.create(OrderItem, {
          product: product,
          quantity: cartItem.quantity,
          price: product.price,
        });
        newOrderItems.push(orderItem);
        calculatedTotalPrice += orderItem.price * orderItem.quantity;
      }

      // 2. Create and save the Order with its items
      const order = transactionalEntityManager.create(Order, {
        user: user,
        items: newOrderItems,
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

      return savedOrder;
    });
  },
  updateOrder: async (
    userId: number,
    orderId: number,
    orderData: { status: string }
  ) => {
    const { status } = orderData;
    if (typeof status !== "string" || status.trim() === "") {
      throw new AppError(
        "Status is required and must be a non-empty string",
        400
      );
    }
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);

    const order = await orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
    });

    if (!order) throw new AppError("Order not found", 404);
    order.status = status;

    return await orderRepo.save(order);
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
};
