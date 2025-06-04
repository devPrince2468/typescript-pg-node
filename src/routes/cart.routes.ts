import { Router } from "express";
import cartController from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User shopping cart operations
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the current user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found or user has no cart yet
 */
router.get("/", authenticate, cartController.getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add a product to the cart or update its quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID of the product to add
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the product
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Product added/updated in cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid input (e.g., product not found, not enough stock)
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, cartController.addProductToCart);

/**
 * @swagger
 * /cart/clearCart:
 *   post:
 *     summary: Clear all items from the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart' # Or a success message
 *       401:
 *         description: Unauthorized
 */
router.post("/clearCart", authenticate, cartController.clearCart);

/**
 * @swagger
 * /cart/{productId}:
 *   put:
 *     summary: Update quantity of a product in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product in the cart to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: New quantity of the product
 *                 minimum: 1 # Or 0 if you allow setting quantity to 0 to remove
 *     responses:
 *       200:
 *         description: Product quantity updated in cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid input (e.g., product not in cart, not enough stock)
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authenticate, cartController.updateProductToCart); // Assuming :id is productId

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to remove from the cart
 *     responses:
 *       200:
 *         description: Product removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in cart
 */
router.delete("/:id", authenticate, cartController.removeProductFromCart); // Assuming :id is productId

export default router;
