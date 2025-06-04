// import "reflect-metadata";
// import * as dotenv from "dotenv";
// dotenv.config();
// import { DataSource } from "typeorm";
// import { User } from "./entities/User";
// import { Product } from "./entities/Product";
// import { Cart } from "./entities/Cart";
// import { CartItem } from "./entities/CartItem";
// import { Order } from "./entities/Order";
// import { OrderItem } from "./entities/OrderItem";

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT) || 5432,
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   synchronize: true,
//   logging: true,
//   entities: [User, Product, Cart, CartItem, Order, OrderItem],
//   migrations: [],
//   subscribers: [],
// });

import "reflect-metadata";
import * as dotenv from "dotenv";

// Load env variables early
dotenv.config();

import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Product } from "./entities/Product";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";

// Validate required env variables
const requiredEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_NAME",
];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV !== "production" ? true : false,
  logging: false,
  entities: [User, Product, Cart, CartItem, Order, OrderItem],
  migrations: [],
  subscribers: [],
});
