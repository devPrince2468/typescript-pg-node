import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { AppError } from "../helpers/AppError";
import { orderRepo } from "../repositories/order.repo";
import { productRepo } from "../repositories/product.repo";
import { userRepo } from "../repositories/user.repo";

export const orderService = {
  getOrders: async (userId) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);

    const orders = await orderRepo.find({
      where: { user: { id: userId } },
      relations: ["items", "items.product", "user"],
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
  createOrder: async (userId, orderData) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new Error("User not found");

    const order = new Order();
    order.user = user;
    order.items = [];
    order.totalPrice = 0;
    order.status = "pending";

    for (const item of orderData) {
      const product = await productRepo.findOneBy({ id: item.productId });
      if (!product)
        throw new AppError(`Product with id ${item.productId} not found`, 404);

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.quantity = item.quantity;
      orderItem.price = item.productPrice;

      order.items.push(orderItem);
    }

    order.totalPrice = order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const savedOrder = await orderRepo.save(order);
    return savedOrder;
  },
  updateOrder: async (userId, orderId, orderData) => {
    // Logic to update an existing order for a user
    return {};
  },
  deleteOrder: async (userId, orderId) => {
    // Logic to delete an existing order for a user
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
