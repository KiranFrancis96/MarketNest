import { ProductRepository } from "@/infrastructure/database/repositoryImpl/product.repository.impl.ts";
import { CategoryRepository } from "@/infrastructure/database/repositoryImpl/category.repository.impl.ts";
import { WishlistRepository } from "@/infrastructure/database/repositoryImpl/wishlist.repository.impl.ts";
import { CartRepository } from "@/infrastructure/database/repositoryImpl/cart.repository.impl.ts";
import { UserRepository } from "@/infrastructure/database/repositoryImpl/user.repository.impl.ts";

import { AddProductUseCase } from "@/application/useCases/product/addProduct.usecase.ts";
import { EditProductUseCase } from "@/application/useCases/product/editProduct.usecase.ts";
import { DeleteProductUseCase } from "@/application/useCases/product/deleteProduct.usecase.ts";
import { GetMerchantProductsUseCase } from "@/application/useCases/product/getMerchantProducts.usecase.ts";
import { GetShoppingProductsUseCase } from "@/application/useCases/product/getShoppingProducts.usecase.ts";
import { SearchProductsUseCase } from "@/application/useCases/product/searchProducts.usecase.ts";
import { GetRecommendationsUseCase } from "@/application/useCases/product/getRecommendations.usecase.ts";

import { ManageCategoriesUseCase } from "@/application/useCases/category/manageCategories.usecase.ts";
import { CartUseCase } from "@/application/useCases/cart/cart.usecase.ts";
import { WishlistUseCase } from "@/application/useCases/wishlist/wishlist.usecase.ts";

import { ProductController } from "@/presentation/http/controllers/product.controller.ts";
import { CategoryController } from "@/presentation/http/controllers/category.controller.ts";
import { CartController } from "@/presentation/http/controllers/cart.controller.ts";
import { WishlistController } from "@/presentation/http/controllers/wishlist.controller.ts";

// 1. Repositories
export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
export const wishlistRepository = new WishlistRepository();
export const cartRepository = new CartRepository();
export const userRepository = new UserRepository();

// 2. Use Cases
export const addProductUseCase = new AddProductUseCase(productRepository);
export const editProductUseCase = new EditProductUseCase(productRepository);
export const deleteProductUseCase = new DeleteProductUseCase(productRepository);
export const getMerchantProductsUseCase = new GetMerchantProductsUseCase(productRepository);
export const getShoppingProductsUseCase = new GetShoppingProductsUseCase(productRepository);
export const searchProductsUseCase = new SearchProductsUseCase(productRepository);
export const getRecommendationsUseCase = new GetRecommendationsUseCase(productRepository, userRepository);

export const manageCategoriesUseCase = new ManageCategoriesUseCase(categoryRepository);
export const cartUseCase = new CartUseCase(cartRepository, productRepository);
export const wishlistUseCase = new WishlistUseCase(wishlistRepository);

// 3. Controllers
export const productController = new ProductController(
  productRepository,
  addProductUseCase,
  editProductUseCase,
  deleteProductUseCase,
  getMerchantProductsUseCase,
  getShoppingProductsUseCase,
  searchProductsUseCase,
  getRecommendationsUseCase
);

export const categoryController = new CategoryController(manageCategoriesUseCase);
export const cartController = new CartController(cartUseCase);
export const wishlistController = new WishlistController(wishlistUseCase);
