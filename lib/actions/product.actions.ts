"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

import {
  CreateProductParams,
  UpdateProductParams,
  ProductFilterParams,
  PaginatedResult,
} from "@/types";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Product, { IProduct } from "../database/models/product.model";
import Counter from "../database/models/counter.model";

// ====================
// Helpers
// ====================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateSku(prefix: string = "PRD"): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { name: "product_sku" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const seq = String(counter.seq).padStart(5, "0");
  return `${prefix}-${seq}`;
}

// ====================
// Create Product
// ====================

export const createProduct = async (params: CreateProductParams) => {
  try {
    await connectToDatabase();

    // Auto-generate slug if not provided or empty
    const slug = params.slug?.trim()
      ? generateSlug(params.slug)
      : generateSlug(params.title);

    // Auto-generate SKU if not provided or empty
    const sku = params.sku?.trim()
      ? params.sku.trim().toUpperCase()
      : await generateSku();

    // Ensure slug uniqueness
    const existingSlug = await Product.findOne({ slug }).select("_id");
    if (existingSlug) {
      throw new Error(`Product with slug "${slug}" already exists`);
    }

    // Ensure SKU uniqueness
    const existingSku = await Product.findOne({ sku }).select("_id");
    if (existingSku) {
      throw new Error(`Product with SKU "${sku}" already exists`);
    }

    const newProduct = await Product.create({
      ...params,
      slug,
      sku,
      category: new Types.ObjectId(params.category),
    });

    revalidatePath("/dashboard");
    revalidatePath("/");

    return JSON.parse(JSON.stringify(newProduct));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get Product by ID
// ====================

export const getProductById = async (productId: string) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId)
      .populate("category", "name slug")
      .lean();

    if (!product) {
      throw new Error("Product not found");
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get Product by Slug
// ====================

export const getProductBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      throw new Error("Product not found");
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get All Products (Paginated & Filtered)
// ====================

export const getProducts = async (
  filters: ProductFilterParams = {},
): Promise<PaginatedResult<IProduct> | undefined> => {
  try {
    await connectToDatabase();

    const {
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      featured,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 12,
    } = filters;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    // Text search
    if (query?.trim()) {
      filter.$text = { $search: query.trim() };
    }

    // Category filter
    if (category?.trim()) {
      filter.category = new Types.ObjectId(category);
    }

    // Brand filter
    if (brand?.trim()) {
      filter.brand = { $regex: new RegExp(`^${brand.trim()}$`, "i") };
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Featured filter
    if (featured !== undefined) {
      filter.featured = featured;
    }

    // Active status filter
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Build sort
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortDirection };

    // Pagination
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const result: PaginatedResult<IProduct> = {
      data: JSON.parse(JSON.stringify(products)),
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return result;
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Update Product
// ====================

export const updateProduct = async (
  productId: string,
  updateData: UpdateProductParams,
) => {
  try {
    await connectToDatabase();

    // If slug is being updated, check uniqueness
    if (updateData.slug?.trim()) {
      updateData.slug = generateSlug(updateData.slug);
      const existingSlug = await Product.findOne({
        slug: updateData.slug,
        _id: { $ne: productId },
      }).select("_id");

      if (existingSlug) {
        throw new Error(`Product with slug "${updateData.slug}" already exists`);
      }
    }

    // If SKU is being updated, check uniqueness
    if (updateData.sku?.trim()) {
      updateData.sku = updateData.sku.trim().toUpperCase();
      const existingSku = await Product.findOne({
        sku: updateData.sku,
        _id: { $ne: productId },
      }).select("_id");

      if (existingSku) {
        throw new Error(`Product with SKU "${updateData.sku}" already exists`);
      }
    }

    // Convert category string to ObjectId if provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = { ...updateData };
    if (updateData.category) {
      updatePayload.category = new Types.ObjectId(updateData.category);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updatePayload },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("category", "name slug")
      .lean();

    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    revalidatePath("/dashboard");
    revalidatePath("/");

    return JSON.parse(JSON.stringify(updatedProduct));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Delete Product
// ====================

export const deleteProduct = async (productId: string) => {
  try {
    await connectToDatabase();

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      throw new Error("Product not found");
    }

    revalidatePath("/dashboard");
    revalidatePath("/");

    return { message: "Product deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Delete Multiple Products
// ====================

export const deleteProducts = async (productIds: string[]) => {
  try {
    await connectToDatabase();

    const objectIds = productIds.map((id) => new Types.ObjectId(id));

    const result = await Product.deleteMany({ _id: { $in: objectIds } });

    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      message: `${result.deletedCount} product(s) deleted successfully`,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Toggle Product Status (Active/Inactive)
// ====================

export const toggleProductStatus = async (productId: string) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId).select("isActive");

    if (!product) {
      throw new Error("Product not found");
    }

    product.isActive = !product.isActive;
    await product.save();

    revalidatePath("/dashboard");

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Toggle Featured Status
// ====================

export const toggleProductFeatured = async (productId: string) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId).select("featured");

    if (!product) {
      throw new Error("Product not found");
    }

    product.featured = !product.featured;
    await product.save();

    revalidatePath("/dashboard");

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Update Stock
// ====================

export const updateProductStock = async (
  productId: string,
  quantity: number,
) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId).select("stock");

    if (!product) {
      throw new Error("Product not found");
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    product.stock = newStock;
    await product.save();

    revalidatePath("/dashboard");

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Add Review
// ====================

export const addProductReview = async (
  productId: string,
  review: {
    user: string; // ObjectId as string
    name: string;
    rating: number;
    comment: string;
  },
) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    // Add review
    product.reviews.push({
      user: new Types.ObjectId(review.user),
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date(),
    });

    // Recalculate average rating
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
      product.numReviews;

    await product.save();

    revalidatePath("/");

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get Featured Products
// ====================

export const getFeaturedProducts = async (limit: number = 8) => {
  try {
    await connectToDatabase();

    const products = await Product.find({
      featured: true,
      isActive: true,
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get Related Products
// ====================

export const getRelatedProducts = async (
  productId: string,
  limit: number = 4,
) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId)
      .select("category tags brand")
      .lean();

    if (!product) {
      throw new Error("Product not found");
    }

    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { category: product.category },
        { tags: { $in: product.tags || [] } },
        { brand: product.brand },
      ],
    })
      .populate("category", "name slug")
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(relatedProducts));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Search Products
// ====================

export const searchProducts = async (
  query: string,
  limit: number = 10,
) => {
  try {
    await connectToDatabase();

    if (!query?.trim()) {
      return [];
    }

    const products = await Product.find({
      $text: { $search: query.trim() },
      isActive: true,
    })
      .select("title slug images price oldPrice rating")
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get Product Count
// ====================

export const getProductCount = async (
  filter: { isActive?: boolean; featured?: boolean } = {},
) => {
  try {
    await connectToDatabase();

    const count = await Product.countDocuments(filter);

    return count;
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get Unique Brands
// ====================

export const getUniqueBrands = async () => {
  try {
    await connectToDatabase();

    const brands = await Product.distinct("brand", { isActive: true });

    return brands.sort();
  } catch (error) {
    handleError(error);
  }
};
