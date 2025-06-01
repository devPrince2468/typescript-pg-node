import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Retrieve a list of orders (Admin sees all, User sees their own)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, orderController.getOrders);

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Retrieve a single order by ID (User sees their own, Admin sees any)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The order ID
 *     responses:
 *       200:
 *         description: A single order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if user tries to access another user's order)
 *       404:
 *         description: Order not found
 */
router.get(
  "/:id",
  authenticate,
  authorize("readOwn", "order"), // Note: Controller logic will need to handle admin override for readAny
  orderController.getOrderById
);

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Create a new order (User action)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items: # This typically would come from the user's cart or a list of product IDs and quantities
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               # Add other fields like shippingAddressId, paymentMethodId etc. if applicable
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input (e.g., items out of stock, bad item format)
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  authorize("createOwn", "order"),
  orderController.createOrder
);

/**
 * @swagger
 * /order/{id}:
 *   put:
 *     summary: Update an order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status or Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  authorize("updateAny", "order"),
  orderController.updateOrder
);

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     summary: Cancel/Delete an order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order deleted/cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize("deleteAny", "order"),
  orderController.deleteOrder
);

export default router;
