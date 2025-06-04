import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";

export const cartRepo = AppDataSource.getRepository(Cart);
