import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import { cloudinaryService } from "@/infrastructure/services/cloudinary.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_PRODUCT_NOT_FOUND, MSG_PRODUCT_NOT_OWNED } from "@/presentation/http/controllers/messages.constants.ts";

export class DeleteProductUseCase {
  constructor(private _productRepository: IProductRepository) {}

  async execute(productId: string, merchantId: string): Promise<boolean> {
    const existingProduct = await this._productRepository.findById(productId);
    if (!existingProduct) {
      throw new ApiError(404, MSG_PRODUCT_NOT_FOUND);
    }

    if (existingProduct.merchantId.toString() !== merchantId) {
      throw new ApiError(403, MSG_PRODUCT_NOT_OWNED);
    }

    const images = existingProduct.images || [];
    for (const url of images) {
      await cloudinaryService.deleteImage(url);
    }

    return await this._productRepository.deleteById(productId);
  }
}
