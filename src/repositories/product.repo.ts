import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";

export const productRepo = AppDataSource.getRepository(Product);
