import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Product } from "@/domain/entities/product.entity.ts";
import { cloudinaryService } from "@/infrastructure/services/cloudinary.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_PRODUCT_CORE_REQUIRED, MSG_PRODUCT_CREATE_FAILED } from "@/presentation/http/controllers/messages.constants.ts";

export class AddProductUseCase {
  constructor(private _productRepository: IProductRepository) {}

  async execute(data: Partial<Product>, files: Express.Multer.File[]): Promise<Product> {
    if (!data.name || !data.category || !data.brand || data.price === undefined || data.stock === undefined || !data.merchantId) {
      throw new ApiError(400, MSG_PRODUCT_CORE_REQUIRED);
    }

    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await cloudinaryService.uploadImages(files);
    }

    const productData: Partial<Product> = {
      name: data.name,
      description: data.description || "",
      category: data.category,
      subcategory: data.subcategory || "",
      brand: data.brand,
      tags: data.tags || [],
      price: Number(data.price),
      stock: Number(data.stock),
      images: imageUrls,
      merchantId: data.merchantId,
      isBlocked: false
    };

    if (data.offerPrice !== undefined && data.offerPrice !== null && (data.offerPrice as any) !== "") {
      productData.offerPrice = Number(data.offerPrice);
    }

    const created = await this._productRepository.create(productData);
    if (!created) {
      throw new ApiError(500, MSG_PRODUCT_CREATE_FAILED);
    }
    return created;
  }
}
