import { BaseRepository } from "./BaseRepository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Product } from "@/domain/entities/product.entity.ts";
import { ProductModel } from "../models/product.model.ts";
import { ProductMapper } from "../mappers/ProductMapper.ts";

export class ProductRepository extends BaseRepository<Product, any> implements IProductRepository {
  constructor() {
    super(ProductModel, ProductMapper);
  }

  async searchProducts(
    query: string,
    limit: number,
    skip: number
  ): Promise<{ products: Product[]; total: number }> {
    const cleanQuery = query.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
    
    const filter = {
      isBlocked: false,
      $or: [
        { name: { $regex: cleanQuery, $options: "i" } },
        { brand: { $regex: cleanQuery, $options: "i" } },
        { category: { $regex: cleanQuery, $options: "i" } },
        { subcategory: { $regex: cleanQuery, $options: "i" } },
        { tags: { $in: [new RegExp(cleanQuery, "i")] } }
      ]
    };

    const docs = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.model.countDocuments(filter);
    
    return {
      products: docs.map((doc) => this.mapper.toEntity(doc) as Product),
      total
    };
  }

  async getPaginated(
    filters: any,
    sortOption: string,
    limit: number,
    skip: number
  ): Promise<{ products: Product[]; total: number }> {
    const query: any = { isBlocked: false };

    if (filters.category) query.category = filters.category;
    if (filters.subcategory) query.subcategory = filters.subcategory;
    if (filters.brand) query.brand = filters.brand;
    if (filters.merchantId) query.merchantId = filters.merchantId;

    if (filters.min !== undefined || filters.max !== undefined) {
      const min = filters.min !== undefined ? Number(filters.min) : 0;
      const max = filters.max !== undefined ? Number(filters.max) : Number.MAX_SAFE_INTEGER;
      
      query.$or = [
        {
          offerPrice: { $exists: true, $ne: null },
          $expr: {
            $and: [
              { $gte: ["$offerPrice", min] },
              { $lte: ["$offerPrice", max] }
            ]
          }
        },
        {
          $or: [{ offerPrice: { $exists: false } }, { offerPrice: null }],
          price: { $gte: min, $lte: max }
        }
      ];
    }

    if (filters.offerOnly === true || filters.offerOnly === "true") {
      query.offerPrice = { $exists: true, $ne: null };
      query.$expr = { $lt: ["$offerPrice", "$price"] };
    }

    let sort: any = { createdAt: -1 };
    if (sortOption === "lowToHigh") {
      sort = { price: 1 };
    } else if (sortOption === "highToLow") {
      sort = { price: -1 };
    } else if (sortOption === "newest") {
      sort = { createdAt: -1 };
    } else if (sortOption === "popularity") {
      sort = { stock: -1 };
    }

    const docs = await this.model
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.model.countDocuments(query);

    return {
      products: docs.map((doc) => this.mapper.toEntity(doc) as Product),
      total
    };
  }
}
