import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Product } from "@/domain/entities/product.entity.ts";

export class GetMerchantProductsUseCase {
  constructor(private _productRepository: IProductRepository) {}

  async execute(merchantId: string): Promise<Product[]> {
    return await this._productRepository.findMany({ merchantId } as any);
  }
}
