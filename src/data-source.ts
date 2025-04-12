import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Product } from "./entity/Product";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Product],
  migrations: [],
  subscribers: [],
});
