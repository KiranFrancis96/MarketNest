import type { ICategoryRepository } from "@/domain/interface/category.repository.ts";
import type { Category } from "@/domain/entities/category.entity.ts";
import type { IAddSubcategoryUseCase } from "@/application/IUseCases/category/ICategoryUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_CAT_SUB_REQUIRED,
  MSG_CATEGORY_NOT_FOUND,
  MSG_SUBCAT_ADD_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class AddSubcategoryUseCase implements IAddSubcategoryUseCase {
  constructor(private _categoryRepository: ICategoryRepository) {}

  async execute(name: string, subcategoryName: string): Promise<Category> {
    if (!name || !subcategoryName) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_CAT_SUB_REQUIRED);
    }

    const category = await this._categoryRepository.findOne({ name });
    if (!category) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_CATEGORY_NOT_FOUND);
    }

    if (category.subcategories.includes(subcategoryName)) {
      return category;
    }

    const updatedSubcategories = [...category.subcategories, subcategoryName];
    const updated = await this._categoryRepository.updateById(category._id!, {
      subcategories: updatedSubcategories
    });

    if (!updated) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_SUBCAT_ADD_FAILED);
    }
    return updated;
  }
}
