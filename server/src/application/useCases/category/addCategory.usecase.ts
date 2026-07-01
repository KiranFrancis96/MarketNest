import type { ICategoryRepository } from "@/domain/interface/category.repository.ts";
import type { Category } from "@/domain/entities/category.entity.ts";
import type { IAddCategoryUseCase } from "@/application/IUseCases/category/ICategoryUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_CATEGORY_REQUIRED,
  MSG_CATEGORY_EXISTS,
  MSG_CATEGORY_CREATE_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class AddCategoryUseCase implements IAddCategoryUseCase {
  constructor(private _categoryRepository: ICategoryRepository) {}

  async execute(name: string, subcategories: string[] = []): Promise<Category> {
    if (!name) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_CATEGORY_REQUIRED);
    }

    const existing = await this._categoryRepository.findOne({ name });
    if (existing) {
      throw new ApiError(HttpStatus.CONFLICT, MSG_CATEGORY_EXISTS);
    }

    const created = await this._categoryRepository.create({ name, subcategories });
    if (!created) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_CATEGORY_CREATE_FAILED);
    }
    return created;
  }
}
