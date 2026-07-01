import { productRepository } from "./repositories.ts";
import { userRepository } from "../user/repositories.ts";
import { AddProductUseCase } from "@/application/useCases/product/addProduct.usecase.ts";
import { EditProductUseCase } from "@/application/useCases/product/editProduct.usecase.ts";
import { DeleteProductUseCase } from "@/application/useCases/product/deleteProduct.usecase.ts";
import { GetMerchantProductsUseCase } from "@/application/useCases/product/getMerchantProducts.usecase.ts";
import { GetShoppingProductsUseCase } from "@/application/useCases/product/getShoppingProducts.usecase.ts";
import { SearchProductsUseCase } from "@/application/useCases/product/searchProducts.usecase.ts";
import { GetRecommendationsUseCase } from "@/application/useCases/product/getRecommendations.usecase.ts";

export const addProductUseCase = new AddProductUseCase(productRepository);
export const editProductUseCase = new EditProductUseCase(productRepository);
export const deleteProductUseCase = new DeleteProductUseCase(productRepository);
export const getMerchantProductsUseCase = new GetMerchantProductsUseCase(productRepository);
export const getShoppingProductsUseCase = new GetShoppingProductsUseCase(productRepository);
export const searchProductsUseCase = new SearchProductsUseCase(productRepository);
export const getRecommendationsUseCase = new GetRecommendationsUseCase(productRepository, userRepository);
