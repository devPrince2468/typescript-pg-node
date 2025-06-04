import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";

export const productRepo = AppDataSource.getRepository(Product);
