import { AppDataSource } from "../data-source";
import { Order } from "../entities/Order";

export const orderRepo = AppDataSource.getRepository(Order);
