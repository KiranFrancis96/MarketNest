import type { Product } from "@/domain/entities/product.entity.ts";

export interface UserPreferences {
  favoriteBrands: string[];
  interestedCategories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  offerSensitive: boolean;
}

export class RecommendationService {
  calculateScore(product: Product, preferences: UserPreferences): number {
    let score = 0;

    const isFavoriteBrand = preferences.favoriteBrands.some(
      (brand) => brand.toLowerCase() === product.brand.toLowerCase()
    );
    if (isFavoriteBrand) score += 5;

    const isInterestedCategory = preferences.interestedCategories.some(
      (category) => category.toLowerCase() === product.category.toLowerCase()
    );
    if (isInterestedCategory) score += 4;

    const finalPrice = product.offerPrice !== undefined && product.offerPrice !== null 
      ? product.offerPrice 
      : product.price;

    const withinPriceRange = 
      finalPrice >= preferences.priceRange.min && 
      finalPrice <= preferences.priceRange.max;
    
    if (withinPriceRange) score += 2;

    const hasOffer = product.offerPrice !== undefined && product.offerPrice !== null && product.offerPrice < product.price;
    if (hasOffer && preferences.offerSensitive) {
      score += 1;
    }

    return score;
  }

  scoreAndSortProducts(products: Product[], preferences: UserPreferences): Product[] {
    const scoredProducts = products.map((product) => ({
      product,
      score: this.calculateScore(product, preferences)
    }));

    scoredProducts.sort((a, b) => b.score - a.score);

    return scoredProducts.map((sp) => sp.product);
  }
}

export const recommendationService = new RecommendationService();
