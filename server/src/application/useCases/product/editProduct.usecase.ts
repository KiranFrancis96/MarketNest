import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Product } from "@/domain/entities/product.entity.ts";
import { cloudinaryService } from "@/infrastructure/services/cloudinary.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_PRODUCT_NOT_FOUND,
  MSG_PRODUCT_NOT_OWNED,
  MSG_PRODUCT_UPDATE_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class EditProductUseCase {
  constructor(private _productRepository: IProductRepository) {}

  async execute(
    productId: string,
    merchantId: string,
    updateData: Partial<Product>,
    files: Express.Multer.File[],
    remainingImages: string[] = []
  ): Promise<Product> {
    const existingProduct = await this._productRepository.findById(productId);
    if (!existingProduct) {
      throw new ApiError(404, MSG_PRODUCT_NOT_FOUND);
    }

    if (existingProduct.merchantId.toString() !== merchantId) {
      throw new ApiError(403, MSG_PRODUCT_NOT_OWNED);
    }

    const originalImages = existingProduct.images || [];
    const removedImages = originalImages.filter((url) => !remainingImages.includes(url));

    for (const url of removedImages) {
      await cloudinaryService.deleteImage(url);
    }

    let newUploadedUrls: string[] = [];
    if (files && files.length > 0) {
      newUploadedUrls = await cloudinaryService.uploadImages(files);
    }

    const finalImages = [...remainingImages, ...newUploadedUrls];

    const fieldsToUpdate: Partial<Product> = {
      images: finalImages
    };

    if (updateData.name !== undefined) fieldsToUpdate.name = updateData.name;
    if (updateData.description !== undefined) fieldsToUpdate.description = updateData.description;
    if (updateData.category !== undefined) fieldsToUpdate.category = updateData.category;
    if (updateData.subcategory !== undefined) fieldsToUpdate.subcategory = updateData.subcategory;
    if (updateData.brand !== undefined) fieldsToUpdate.brand = updateData.brand;
    if (updateData.tags !== undefined) fieldsToUpdate.tags = updateData.tags;
    if (updateData.price !== undefined) fieldsToUpdate.price = Number(updateData.price);
    if (updateData.stock !== undefined) fieldsToUpdate.stock = Number(updateData.stock);

    if (updateData.offerPrice !== undefined && updateData.offerPrice !== null && (updateData.offerPrice as any) !== "") {
      fieldsToUpdate.offerPrice = Number(updateData.offerPrice);
    }

    const updated = await this._productRepository.updateById(productId, fieldsToUpdate);
    if (!updated) {
      throw new ApiError(500, MSG_PRODUCT_UPDATE_FAILED);
    }
    return updated;
  }
}
