import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "API documentation for the E-commerce application",
      contact: {
        name: "Your Name / Company",
        email: "your.email@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
            },
            image: { type: "string", example: "http://example.com/avatar.jpg" },
            role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Awesome T-Shirt" },
            description: {
              type: "string",
              example: "Comfortable cotton t-shirt",
            },
            price: { type: "number", format: "float", example: 19.99 },
            category: { type: "string", example: "Apparel" },
            image: { type: "string", example: "http://example.com/image.jpg" },
            stock: { type: "integer", example: 100 },
            available: { type: "integer", example: 90 },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            productId: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2 },
            price: { type: "number", format: "float", example: 19.99 },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 101 },
            userId: { type: "integer", example: 1 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalAmount: { type: "number", format: "float", example: 39.98 },
            status: {
              type: "string",
              enum: [
                "PENDING",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
              ],
              example: "PENDING",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            productId: { type: "integer" },
            quantity: { type: "integer", minimum: 1 },
          },
        },
        Cart: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the API docs
  // Looks for empirical files in the routes folder recursively with any of the following extensions
  apis: [
    path.join(__dirname, "./routes/**/*.js"),
    path.join(__dirname, "./routes/**/*.ts"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
