import type { Request, Response } from "express";
import type {
  IAddProductUseCase,
  IEditProductUseCase,
  IDeleteProductUseCase,
  IGetMerchantProductsUseCase,
  IGetShoppingProductsUseCase,
  ISearchProductsUseCase,
  IGetRecommendationsUseCase,
} from "@/application/IUseCases/product/IProductUseCases.ts";
import type { GetShoppingProductsInputDTO } from "@/application/useCases/product/getShoppingProducts.usecase.ts";
import type { SearchProductsInputDTO } from "@/application/useCases/product/searchProducts.usecase.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import {
  MSG_UNAUTHORIZED,
  MSG_PRODUCT_ID_STRING,
  MSG_PRODUCT_NOT_FOUND,
  MSG_PRODUCT_BLOCKED_REQUIRED,
  MSG_PRODUCT_ADDED_SUCCESS,
  MSG_PRODUCT_UPDATED_SUCCESS,
  MSG_PRODUCT_DELETED_SUCCESS,
  MSG_PRODUCT_BLOCKED_SUCCESS,
  MSG_PRODUCT_UNBLOCKED_SUCCESS,
} from "@/presentation/http/controllers/messages.constants.ts";

export class ProductController {
  constructor(
    private _productRepository: IProductRepository,
    private _addProductUseCase: IAddProductUseCase,
    private _editProductUseCase: IEditProductUseCase,
    private _deleteProductUseCase: IDeleteProductUseCase,
    private _getMerchantProductsUseCase: IGetMerchantProductsUseCase,
    private _getShoppingProductsUseCase: IGetShoppingProductsUseCase,
    private _searchProductsUseCase: ISearchProductsUseCase,
    private _getRecommendationsUseCase: IGetRecommendationsUseCase
  ) {}

  add = async (req: Request, res: Response): Promise<void> => {
    const merchantId = req.merchant?.id || req.user?.id;
    if (!merchantId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
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
    res.status(HttpStatus.CREATED).json({ message: MSG_PRODUCT_ADDED_SUCCESS, product });
  };

  edit = async (req: Request, res: Response): Promise<void> => {
    const merchantId = req.merchant?.id || req.user?.id;
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_ID_STRING);
    }
    if (!merchantId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
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
    res.json({ message: MSG_PRODUCT_UPDATED_SUCCESS, product });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const merchantId = req.merchant?.id || req.user?.id;
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_ID_STRING);
    }
    if (!merchantId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    await this._deleteProductUseCase.execute(id, merchantId);
    res.json({ message: MSG_PRODUCT_DELETED_SUCCESS });
  };

  getMerchantProducts = async (req: Request, res: Response): Promise<void> => {
    const merchantId = req.merchant?.id || req.user?.id;
    if (!merchantId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const products = await this._getMerchantProductsUseCase.execute(merchantId);
    res.json(products);
  };

  getShoppingProducts = async (req: Request, res: Response): Promise<void> => {
    const productsFeed = await this._getShoppingProductsUseCase.execute(req.query as unknown as GetShoppingProductsInputDTO);
    res.json(productsFeed);
  };

  search = async (req: Request, res: Response): Promise<void> => {
    const { q, page, limit } = req.query;
    const searchInput: SearchProductsInputDTO = { query: (q as string) || "" };
    if (page) searchInput.page = Number(page);
    if (limit) searchInput.limit = Number(limit);

    const searchFeed = await this._searchProductsUseCase.execute(searchInput);
    res.json(searchFeed);
  };

  getRecommendations = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const recommendations = await this._getRecommendationsUseCase.execute(userId);
    res.json(recommendations);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_ID_STRING);
    }
    const product = await this._productRepository.findById(id);
    if (!product || product.isBlocked) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_PRODUCT_NOT_FOUND);
    }
    res.json(product);
  };

  toggleBlock = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_ID_STRING);
    }
    const { isBlocked } = req.body;
    
    if (isBlocked === undefined) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_BLOCKED_REQUIRED);
    }

    const updated = await this._productRepository.updateById(id, { isBlocked });
    if (!updated) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_PRODUCT_NOT_FOUND);
    }

    res.json({ 
      message: isBlocked ? MSG_PRODUCT_BLOCKED_SUCCESS : MSG_PRODUCT_UNBLOCKED_SUCCESS, 
      product: updated 
    });
  };
}
