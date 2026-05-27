import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Product } from "@/domain/entities/product.entity.ts";

export interface SearchProductsInputDTO {
  query: string;
  page?: number;
  limit?: number;
}

export interface SearchProductsOutputDTO {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SearchProductsUseCase {
  constructor(private _productRepository: IProductRepository) {}

  async execute(input: SearchProductsInputDTO): Promise<SearchProductsOutputDTO> {
    const page = input.page && Number(input.page) > 0 ? Number(input.page) : 1;
    const limit = input.limit && Number(input.limit) > 0 ? Number(input.limit) : 12;
    const skip = (page - 1) * limit;
    const query = input.query || "";

    if (!query.trim()) {
      return {
        products: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }

    const { products, total } = await this._productRepository.searchProducts(
      query,
      limit,
      skip
    );

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
