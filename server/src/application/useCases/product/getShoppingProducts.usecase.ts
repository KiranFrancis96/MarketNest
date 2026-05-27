import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Product } from "@/domain/entities/product.entity.ts";

export interface GetShoppingProductsInputDTO {
  category?: string;
  subcategory?: string;
  brand?: string;
  min?: number;
  max?: number;
  offerOnly?: boolean | string;
  sort?: string;
  page?: number;
  limit?: number;
  merchantId?: string;
}

export interface GetShoppingProductsOutputDTO {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class GetShoppingProductsUseCase {
  constructor(private _productRepository: IProductRepository) {}

  async execute(input: GetShoppingProductsInputDTO): Promise<GetShoppingProductsOutputDTO> {
    const page = input.page && Number(input.page) > 0 ? Number(input.page) : 1;
    const limit = input.limit && Number(input.limit) > 0 ? Number(input.limit) : 12;
    const skip = (page - 1) * limit;

    const filters = {
      category: input.category,
      subcategory: input.subcategory,
      brand: input.brand,
      min: input.min,
      max: input.max,
      offerOnly: input.offerOnly,
      merchantId: input.merchantId,
    };

    const sortOption = input.sort || "newest";

    const { products, total } = await this._productRepository.getPaginated(
      filters,
      sortOption,
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
