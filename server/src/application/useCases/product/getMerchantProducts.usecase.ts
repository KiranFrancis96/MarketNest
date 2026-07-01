import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Product } from "@/domain/entities/product.entity.ts";
import type { IGetMerchantProductsUseCase } from "@/application/IUseCases/product/IProductUseCases.ts";

export class GetMerchantProductsUseCase implements IGetMerchantProductsUseCase {
  constructor(private _productRepository: IProductRepository) {}

  async execute(merchantId: string): Promise<Product[]> {
    return await this._productRepository.findMany({ merchantId });
  }
}
