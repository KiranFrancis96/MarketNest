import type { Product } from "@/domain/entities/product.entity.ts";
import type {
  GetShoppingProductsInputDTO,
  GetShoppingProductsOutputDTO,
} from "@/application/useCases/product/getShoppingProducts.usecase.ts";
import type {
  SearchProductsInputDTO,
  SearchProductsOutputDTO,
} from "@/application/useCases/product/searchProducts.usecase.ts";
import type {
  RecommendationsOutputDTO,
} from "@/application/useCases/product/getRecommendations.usecase.ts";

export interface IAddProductUseCase {
  execute(data: Partial<Product>, files: Express.Multer.File[]): Promise<Product>;
}

export interface IEditProductUseCase {
  execute(
    productId: string,
    merchantId: string,
    updateData: Partial<Product>,
    files: Express.Multer.File[],
    remainingImages?: string[]
  ): Promise<Product>;
}

export interface IDeleteProductUseCase {
  execute(productId: string, merchantId: string): Promise<boolean>;
}

export interface IGetMerchantProductsUseCase {
  execute(merchantId: string): Promise<Product[]>;
}

export interface IGetShoppingProductsUseCase {
  execute(input: GetShoppingProductsInputDTO): Promise<GetShoppingProductsOutputDTO>;
}

export interface ISearchProductsUseCase {
  execute(input: SearchProductsInputDTO): Promise<SearchProductsOutputDTO>;
}

export interface IGetRecommendationsUseCase {
  execute(userId?: string): Promise<RecommendationsOutputDTO>;
}
