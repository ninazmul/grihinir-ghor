import { Document, Schema, Types, model, models } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IVariant {
  name: string; // Color, Size
  value: string; // Black, XL
}

export interface IDimensions {
  length: number;
  width: number;
  height: number;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;

  // Basic
  title: string;
  slug: string;
  description: string;
  brand: string;
  category: Types.ObjectId;

  // Media
  images: string[];

  // Pricing
  price: number;
  oldPrice?: number;

  // Inventory
  sku: string;
  stock: number;
  sold: number;

  // Reviews
  rating: number;
  numReviews: number;
  reviews: IReview[];

  // Product Details
  tags: string[];
  variants: IVariant[];

  // Shipping
  weight?: number;
  dimensions?: IDimensions;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Status
  featured: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

const VariantSchema = new Schema<IVariant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const DimensionSchema = new Schema<IDimensions>(
  {
    length: Number,
    width: Number,
    height: Number,
  },
  { _id: false },
);

const ProductSchema = new Schema<IProduct>(
  {
    // Basic
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // Images
    images: {
      type: [String],
      default: [],
    },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      min: 0,
    },

    // Inventory
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sold: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: [ReviewSchema],
      default: [],
    },

    // Product Details
    tags: {
      type: [String],
      default: [],
    },

    variants: {
      type: [VariantSchema],
      default: [],
    },

    // Shipping
    weight: Number,

    dimensions: DimensionSchema,

    // SEO
    seoTitle: String,

    seoDescription: String,

    // Status
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Helpful indexes
ProductSchema.index({ title: "text", description: "text", brand: "text" });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });

const Product = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;
