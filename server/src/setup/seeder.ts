import { CategoryModel } from "../infrastructure/database/models/category.model.ts";
import logger from "../utils/logger.ts";

const DEFAULT_CATEGORIES = [
  {
    name: "Electronics",
    subcategories: ["Smartphones", "Laptops", "Headphones", "Smartwatches", "Accessories"]
  },
  {
    name: "Clothing & Fashion",
    subcategories: ["Men's Wear", "Women's Wear", "Kids' Wear", "Footwear", "Watches"]
  },
  {
    name: "Home & Kitchen",
    subcategories: ["Furniture", "Kitchen Appliances", "Home Decor", "Bedding", "Cookware"]
  },
  {
    name: "Beauty & Personal Care",
    subcategories: ["Skincare", "Cosmetics", "Fragrances", "Haircare", "Grooming"]
  },
  {
    name: "Sports & Outdoors",
    subcategories: ["Fitness Equipment", "Outdoor Gear", "Athletic Clothing", "Footwear"]
  }
];

export async function seedCategories() {
  try {
    const count = await CategoryModel.countDocuments();
    if (count === 0) {
      logger.info("Category database collection is empty. Seeding default categories...");
      await CategoryModel.insertMany(DEFAULT_CATEGORIES);
      logger.info("Default categories seeded successfully!");
    } else {
      logger.info(`Found ${count} categories in DB. Skipping seeder.`);
    }
  } catch (error) {
    logger.error(error, "Failed to seed default categories");
  }
}
