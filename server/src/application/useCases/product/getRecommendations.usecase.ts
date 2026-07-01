import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { Product } from "@/domain/entities/product.entity.ts";
import type { IGetRecommendationsUseCase } from "@/application/IUseCases/product/IProductUseCases.ts";
import { recommendationService, type UserPreferences } from "@/infrastructure/services/RecommendationService.ts";

export interface RecommendationsOutputDTO {
  recommendedForYou: Product[];
  dealsYouMayLike: Product[];
  trendingProducts: Product[];
  basedOnShoppingStyle: Product[];
}

export class GetRecommendationsUseCase implements IGetRecommendationsUseCase {
  constructor(
    private _productRepository: IProductRepository,
    private _userRepository: IUserRepository
  ) {}

  async execute(userId?: string): Promise<RecommendationsOutputDTO> {
    let preferences: UserPreferences = {
      favoriteBrands: [],
      interestedCategories: [],
      priceRange: { min: 0, max: 100000 },
      offerSensitive: true
    };

    if (userId) {
      const user = await this._userRepository.findById(userId);
      if (user && user.preferences) {
        preferences = {
          favoriteBrands: user.preferences.favoriteBrands || [],
          interestedCategories: user.preferences.interestedCategories || [],
          priceRange: {
            min: user.preferences.priceRange?.min !== undefined ? Number(user.preferences.priceRange.min) : 0,
            max: user.preferences.priceRange?.max !== undefined ? Number(user.preferences.priceRange.max) : 100000,
          },
          offerSensitive: user.preferences.offerSensitive ?? true
        };
      }
    }

    const products = await this._productRepository.findMany({ isBlocked: false });

    const recommended = recommendationService.scoreAndSortProducts(products, preferences).slice(0, 8);

    const deals = products
      .filter((p) => p.offerPrice !== undefined && p.offerPrice !== null && p.offerPrice < p.price)
      .map((p) => ({
        product: p,
        score: recommendationService.calculateScore(p, preferences)
      }));
    deals.sort((a, b) => b.score - a.score);
    const dealsYouMayLike = deals.map((d) => d.product).slice(0, 8);

    const trending = [...products];
    trending.sort((a, b) => b.stock - a.stock);
    const trendingProducts = trending.slice(0, 8);

    let shoppingStyleProducts: Product[] = [];
    if (preferences.interestedCategories.length > 0 || preferences.favoriteBrands.length > 0) {
      shoppingStyleProducts = products.filter((p) => {
        const matchesCategory = preferences.interestedCategories.some(
          (c) => c.toLowerCase() === p.category.toLowerCase()
        );
        const matchesBrand = preferences.favoriteBrands.some(
          (b) => b.toLowerCase() === p.brand.toLowerCase()
        );
        return matchesCategory || matchesBrand;
      });
      shoppingStyleProducts = recommendationService.scoreAndSortProducts(shoppingStyleProducts, preferences).slice(0, 8);
    } else {
      shoppingStyleProducts = products.slice(0, 8);
    }

    return {
      recommendedForYou: recommended,
      dealsYouMayLike,
      trendingProducts,
      basedOnShoppingStyle: shoppingStyleProducts
    };
  }
}
