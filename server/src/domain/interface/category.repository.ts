import type { IBaseRepository } from "./IBaseRepository.ts";
import type { Category } from "../entities/category.entity.ts";

export interface ICategoryRepository extends IBaseRepository<Category> {}
