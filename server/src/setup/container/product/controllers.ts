import { ProductController } from "@/presentation/http/controllers/product.controller.ts";
import { productRepository } from "./repositories.ts";
import * as useCases from "./useCases.ts";

export const productController = new ProductController(
  productRepository,
  useCases.addProductUseCase,
  useCases.editProductUseCase,
  useCases.deleteProductUseCase,
  useCases.getMerchantProductsUseCase,
  useCases.getShoppingProductsUseCase,
  useCases.searchProductsUseCase,
  useCases.getRecommendationsUseCase
);
