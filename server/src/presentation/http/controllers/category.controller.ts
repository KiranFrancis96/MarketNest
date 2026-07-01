import type { Request, Response } from "express";
import type {
  IGetAllCategoriesUseCase,
  IAddCategoryUseCase,
  IAddSubcategoryUseCase,
} from "@/application/IUseCases/category/ICategoryUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_CATEGORY_CREATED_SUCCESS,
  MSG_SUBCATEGORY_ADDED_SUCCESS,
} from "@/presentation/http/controllers/messages.constants.ts";

export class CategoryController {
  constructor(
    private _getAllCategoriesUseCase: IGetAllCategoriesUseCase,
    private _addCategoryUseCase: IAddCategoryUseCase,
    private _addSubcategoryUseCase: IAddSubcategoryUseCase
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const categories = await this._getAllCategoriesUseCase.execute();
    res.json(categories);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { name, subcategories } = req.body;
    const category = await this._addCategoryUseCase.execute(name, subcategories);
    res.status(HttpStatus.CREATED).json({ message: MSG_CATEGORY_CREATED_SUCCESS, category });
  };

  addSubcategory = async (req: Request, res: Response): Promise<void> => {
    const { name, subcategoryName } = req.body;
    const category = await this._addSubcategoryUseCase.execute(name, subcategoryName);
    res.json({ message: MSG_SUBCATEGORY_ADDED_SUCCESS, category });
  };
}
