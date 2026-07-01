import type { IBaseRepository } from "./IBaseRepository.ts";
import type { Product } from "../entities/product.entity.ts";

export interface IProductRepository extends IBaseRepository<Product> {
  searchProducts(
    query: string,
    limit: number,
    skip: number
  ): Promise<{ products: Product[]; total: number }>;

  getPaginated(
    filters: Record<string, unknown>,
    sort: string,
    limit: number,
    skip: number
  ): Promise<{ products: Product[]; total: number }>;
}
