import { CategoryController } from "@/presentation/http/controllers/category.controller.ts";
import * as useCases from "./useCases.ts";

export const categoryController = new CategoryController(
  useCases.getAllCategoriesUseCase,
  useCases.addCategoryUseCase,
  useCases.addSubcategoryUseCase
);
