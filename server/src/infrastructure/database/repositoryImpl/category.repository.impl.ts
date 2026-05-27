import { BaseRepository } from "./BaseRepository.ts";
import type { ICategoryRepository } from "@/domain/interface/category.repository.ts";
import type { Category } from "@/domain/entities/category.entity.ts";
import { CategoryModel } from "../models/category.model.ts";
import { CategoryMapper } from "../mappers/CategoryMapper.ts";

export class CategoryRepository extends BaseRepository<Category, any> implements ICategoryRepository {
  constructor() {
    super(CategoryModel, CategoryMapper);
  }
}
