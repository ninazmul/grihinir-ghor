"use server";

import { connectToDatabase } from "../database";
import Category from "../database/models/category.model";
import { handleError } from "../utils";

const DEFAULT_CATEGORIES = [
  { name: "Kitchen Accessories", slug: "kitchen-accessories" },
  { name: "Home Decor", slug: "home-decor" },
  { name: "Daily Utilities", slug: "daily-utilities" },
  { name: "Organic Food", slug: "organic-food" },
  { name: "Handcrafted Items", slug: "handcrafted-items" },
];

export const getCategories = async () => {
  try {
    await connectToDatabase();

    let categories = await Category.find().sort({ name: 1 }).lean();

    // Auto-seed if empty so the user isn't stuck with an empty dropdown
    if (categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find().sort({ name: 1 }).lean();
    }

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
};

export const createCategory = async (name: string) => {
  try {
    await connectToDatabase();

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newCategory = await Category.create({ name, slug });
    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    handleError(error);
  }
};
