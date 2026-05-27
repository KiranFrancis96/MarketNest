import type { Request, Response } from "express";
import { AddProductUseCase } from "@/application/useCases/product/addProduct.usecase.ts";
import { EditProductUseCase } from "@/application/useCases/product/editProduct.usecase.ts";
import { DeleteProductUseCase } from "@/application/useCases/product/deleteProduct.usecase.ts";
import { GetMerchantProductsUseCase } from "@/application/useCases/product/getMerchantProducts.usecase.ts";
import { GetShoppingProductsUseCase } from "@/application/useCases/product/getShoppingProducts.usecase.ts";
import { SearchProductsUseCase } from "@/application/useCases/product/searchProducts.usecase.ts";
import { GetRecommendationsUseCase } from "@/application/useCases/product/getRecommendations.usecase.ts";
import { ApiError } from "@/utils/apiError.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import {
  MSG_UNAUTHORIZED,
  MSG_PRODUCT_ID_STRING,
  MSG_PRODUCT_NOT_FOUND,
  MSG_PRODUCT_BLOCKED_REQUIRED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class ProductController {
  constructor(
    private _productRepository: IProductRepository,
    private _addProductUseCase: AddProductUseCase,
    private _editProductUseCase: EditProductUseCase,
    private _deleteProductUseCase: DeleteProductUseCase,
    private _getMerchantProductsUseCase: GetMerchantProductsUseCase,
    private _getShoppingProductsUseCase: GetShoppingProductsUseCase,
    private _searchProductsUseCase: SearchProductsUseCase,
    private _getRecommendationsUseCase: GetRecommendationsUseCase
  ) {}

  add = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    if (!merchantId) {
      throw new ApiError(401, MSG_UNAUTHORIZED);
    }

    const files = (req.files as Express.Multer.File[]) || [];
    
    let tags = req.body.tags || [];
    if (typeof tags === "string") {
      try { tags = JSON.parse(tags); } catch { tags = tags.split(",").map((t: string) => t.trim()); }
    }

    const product = await this._addProductUseCase.execute(
      { ...req.body, tags, merchantId },
      files
    );
    res.status(201).json({ message: "Product added successfully", product });
  };

  edit = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new ApiError(400, MSG_PRODUCT_ID_STRING);
    }
    if (!merchantId) {
      throw new ApiError(401, MSG_UNAUTHORIZED);
    }

    const files = (req.files as Express.Multer.File[]) || [];

    let remaining: string[] = [];
    if (req.body.remainingImages) {
      try {
        remaining = typeof req.body.remainingImages === "string"
          ? JSON.parse(req.body.remainingImages)
          : req.body.remainingImages;
      } catch {
        remaining = [];
      }
    }

    let tags = req.body.tags;
    if (typeof tags === "string") {
      try { tags = JSON.parse(tags); } catch { tags = tags.split(",").map((t: string) => t.trim()); }
    }

    const product = await this._editProductUseCase.execute(
      id,
      merchantId,
      { ...req.body, tags },
      files,
      remaining
    );
    res.json({ message: "Product updated successfully", product });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new ApiError(400, MSG_PRODUCT_ID_STRING);
    }
    if (!merchantId) {
      throw new ApiError(401, MSG_UNAUTHORIZED);
    }

    await this._deleteProductUseCase.execute(id, merchantId);
    res.json({ message: "Product deleted successfully" });
  };

  getMerchantProducts = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    if (!merchantId) {
      throw new ApiError(401, MSG_UNAUTHORIZED);
    }

    const products = await this._getMerchantProductsUseCase.execute(merchantId);
    res.json(products);
  };

  getShoppingProducts = async (req: Request, res: Response): Promise<void> => {
    const productsFeed = await this._getShoppingProductsUseCase.execute(req.query as any);
    res.json(productsFeed);
  };

  search = async (req: Request, res: Response): Promise<void> => {
    const { q, page, limit } = req.query;
    const searchInput: any = { query: (q as string) || "" };
    if (page) searchInput.page = Number(page);
    if (limit) searchInput.limit = Number(limit);

    const searchFeed = await this._searchProductsUseCase.execute(searchInput);
    res.json(searchFeed);
  };

  getRecommendations = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    const recommendations = await this._getRecommendationsUseCase.execute(userId);
    res.json(recommendations);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new ApiError(400, MSG_PRODUCT_ID_STRING);
    }
    const product = await this._productRepository.findById(id);
    if (!product || product.isBlocked) {
      throw new ApiError(404, MSG_PRODUCT_NOT_FOUND);
    }
    res.json(product);
  };

  toggleBlock = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new ApiError(400, MSG_PRODUCT_ID_STRING);
    }
    const { isBlocked } = req.body;
    
    if (isBlocked === undefined) {
      throw new ApiError(400, MSG_PRODUCT_BLOCKED_REQUIRED);
    }

    const updated = await this._productRepository.updateById(id, { isBlocked });
    if (!updated) {
      throw new ApiError(404, MSG_PRODUCT_NOT_FOUND);
    }

    res.json({ 
      message: `Product ${isBlocked ? "blocked" : "unblocked"} successfully`, 
      product: updated 
    });
  };
}
