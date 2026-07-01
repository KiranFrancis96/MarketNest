import type { ICategoryRepository } from "@/domain/interface/category.repository.ts";
import type { Category } from "@/domain/entities/category.entity.ts";
import type { IGetAllCategoriesUseCase } from "@/application/IUseCases/category/ICategoryUseCases.ts";

export class GetAllCategoriesUseCase implements IGetAllCategoriesUseCase {
  constructor(private _categoryRepository: ICategoryRepository) {}

  async execute(): Promise<Category[]> {
    return await this._categoryRepository.findMany({});
  }
}
