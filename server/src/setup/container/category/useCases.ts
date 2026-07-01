import { categoryRepository } from "./repositories.ts";
import { GetAllCategoriesUseCase } from "@/application/useCases/category/getAllCategories.usecase.ts";
import { AddCategoryUseCase } from "@/application/useCases/category/addCategory.usecase.ts";
import { AddSubcategoryUseCase } from "@/application/useCases/category/addSubcategory.usecase.ts";

export const getAllCategoriesUseCase = new GetAllCategoriesUseCase(categoryRepository);
export const addCategoryUseCase = new AddCategoryUseCase(categoryRepository);
export const addSubcategoryUseCase = new AddSubcategoryUseCase(categoryRepository);
