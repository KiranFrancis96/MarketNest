import type { Request, Response } from "express";
import { ManageCategoriesUseCase } from "@/application/useCases/category/manageCategories.usecase.ts";
import { ApiError } from "@/utils/apiError.ts";

export class CategoryController {
  constructor(private _manageCategoriesUseCase: ManageCategoriesUseCase) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const categories = await this._manageCategoriesUseCase.getAll();
    res.json(categories);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { name, subcategories } = req.body;
    const category = await this._manageCategoriesUseCase.addCategory(name, subcategories);
    res.status(201).json({ message: "Category created successfully", category });
  };

  addSubcategory = async (req: Request, res: Response): Promise<void> => {
    const { name, subcategoryName } = req.body;
    const category = await this._manageCategoriesUseCase.addSubcategory(name, subcategoryName);
    res.json({ message: "Subcategory added successfully", category });
  };
}
