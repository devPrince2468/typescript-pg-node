import { AppDataSource } from "../data-source";
import { OrderItem } from "../entities/OrderItem";

export const orderItemRepo = AppDataSource.getRepository(OrderItem);
