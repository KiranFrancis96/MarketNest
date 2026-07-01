import { CategoryModel } from "../infrastructure/database/models/category.model.ts";
import { UserModel } from "../infrastructure/database/models/user.model.ts";
import bcrypt from "bcrypt";
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(err, "Failed to seed default categories");
  }
}

export async function seedUsers() {
  try {
    const adminCount = await UserModel.countDocuments({ isAdmin: true });
    if (adminCount === 0) {
      logger.info("Admin database is empty. Seeding default admin...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await UserModel.create({
        firstName: "System",
        lastName: "Admin",
        email: "admin@marketnest.com",
        password: hashedPassword,
        isAdmin: true,
        isVerified: true
      });
      logger.info("Default admin seeded: admin@marketnest.com / admin123");
    }

    const userCount = await UserModel.countDocuments({ isAdmin: false });
    if (userCount === 0) {
      logger.info("User database is empty. Seeding default user...");
      const hashedPassword = await bcrypt.hash("user123", 10);
      await UserModel.create({
        firstName: "Test",
        lastName: "User",
        email: "user@marketnest.com",
        password: hashedPassword,
        isAdmin: false,
        isVerified: true
      });
      logger.info("Default user seeded: user@marketnest.com / user123");
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(err, "Failed to seed default users");
  }
}


