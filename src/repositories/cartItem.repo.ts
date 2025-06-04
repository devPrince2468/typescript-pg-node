import { AppDataSource } from "../data-source";
import { CartItem } from "../entities/CartItem";

export const cartItemRepo = AppDataSource.getRepository(CartItem);
