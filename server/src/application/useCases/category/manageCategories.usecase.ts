import type { ICategoryRepository } from "@/domain/interface/category.repository.ts";
import type { Category } from "@/domain/entities/category.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_CATEGORY_REQUIRED,
  MSG_CATEGORY_EXISTS,
  MSG_CATEGORY_CREATE_FAILED,
  MSG_CAT_SUB_REQUIRED,
  MSG_CATEGORY_NOT_FOUND,
  MSG_SUBCAT_ADD_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class ManageCategoriesUseCase {
  constructor(private _categoryRepository: ICategoryRepository) {}

  async getAll(): Promise<Category[]> {
    return await this._categoryRepository.findMany({});
  }

  async addCategory(name: string, subcategories: string[] = []): Promise<Category> {
    if (!name) {
      throw new ApiError(400, MSG_CATEGORY_REQUIRED);
    }

    const existing = await this._categoryRepository.findOne({ name });
    if (existing) {
      throw new ApiError(409, MSG_CATEGORY_EXISTS);
    }

    const created = await this._categoryRepository.create({ name, subcategories });
    if (!created) {
      throw new ApiError(500, MSG_CATEGORY_CREATE_FAILED);
    }
    return created;
  }

  async addSubcategory(name: string, subcategoryName: string): Promise<Category> {
    if (!name || !subcategoryName) {
      throw new ApiError(400, MSG_CAT_SUB_REQUIRED);
    }

    const category = await this._categoryRepository.findOne({ name });
    if (!category) {
      throw new ApiError(404, MSG_CATEGORY_NOT_FOUND);
    }

    if (category.subcategories.includes(subcategoryName)) {
      return category;
    }

    const updatedSubcategories = [...category.subcategories, subcategoryName];
    const updated = await this._categoryRepository.updateById(category._id!, {
      subcategories: updatedSubcategories
    });

    if (!updated) {
      throw new ApiError(500, MSG_SUBCAT_ADD_FAILED);
    }
    return updated;
  }
}
