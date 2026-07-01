import type { Category } from "@/domain/entities/category.entity.ts";

export interface IGetAllCategoriesUseCase {
  execute(): Promise<Category[]>;
}

export interface IAddCategoryUseCase {
  execute(name: string, subcategories?: string[]): Promise<Category>;
}

export interface IAddSubcategoryUseCase {
  execute(name: string, subcategoryName: string): Promise<Category>;
}
