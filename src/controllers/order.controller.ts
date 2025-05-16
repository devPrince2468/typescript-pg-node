import { orderService } from "../services/order.service";

export const orderController = {
  getOrders: async (req, res, next) => {
    try {
      const orders = await orderService.getOrders(req.user.id);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, res, next) => {
    try {
      const order = await orderService.getOrderById(req.user.id, req.params.id);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  createOrder: async (req, res, next) => {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);
      res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
      next(error);
    }
  },

  updateOrder: async (req, res, next) => {
    try {
      const order = await orderService.updateOrder(
        req.user.id,
        req.params.id,
        req.body
      );
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  deleteOrder: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      await orderService.deleteOrder(userId, orderId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

export default orderController;
