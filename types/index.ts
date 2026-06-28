// ====== ADMIN PARAMS
export type AdminParams = {
  Name: string;
  Email: string;
  Role: string;
};

// ====== URL QUERY PARAMS
export type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

export type RemoveUrlQueryParams = {
  params: string;
  keysToRemove: string[];
};

// ====== SETTINGS PARAMS

export interface IFaqItem {
  question: string;
  answer: string;
}

export interface SettingParams {
  branding: {
    storeName?: string;
    logo?: string;
    favicon?: string;
    tagline?: string;
    description?: string;
  };

  contact: {
    email?: string;
    phoneNumber?: string;
    whatsapp?: string;
    address?: string;
  };

  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebookGroup?: string;
    linkedin?: string;
    tiktok?: string;
  };

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };

  hero: {
    images?: string[];
  };

  policies: {
    returnPolicy?: string;
    privacyPolicy?: string;
    termsOfService?: string;
  };

  faqs: {
    badge?: string;
    title?: string;
    description?: string;
    items?: IFaqItem[];
  };

  analytics: {
    facebookPixelId?: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

// ====== PRODUCT PARAMS

export interface ProductVariantParams {
  name: string;
  value: string;
}

export interface ProductDimensionsParams {
  length?: number;
  width?: number;
  height?: number;
}

export interface CreateProductParams {
  title: string;
  slug?: string;
  description: string;
  brand: string;
  category: string; // ObjectId as string
  images?: string[];
  price: number;
  oldPrice?: number;
  sku?: string;
  stock?: number;
  tags?: string[];
  variants?: ProductVariantParams[];
  weight?: number;
  dimensions?: ProductDimensionsParams;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  isActive?: boolean;
}

export interface UpdateProductParams {
  title?: string;
  slug?: string;
  description?: string;
  brand?: string;
  category?: string;
  images?: string[];
  price?: number;
  oldPrice?: number;
  sku?: string;
  stock?: number;
  tags?: string[];
  variants?: ProductVariantParams[];
  weight?: number;
  dimensions?: ProductDimensionsParams;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  isActive?: boolean;
}

export interface ProductFilterParams {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  isActive?: boolean;
  sortBy?: "price" | "rating" | "createdAt" | "sold" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ====== ORDER PARAMS

export interface CreateOrderItemParams {
  product: string; // ObjectId as string
  title: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface CreateOrderParams {
  items: CreateOrderItemParams[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    district?: string;
    postalCode?: string;
  };
  deliveryCharge: number;
  paymentMethod?: string;
  notes?: string;
}

export interface OrderFilterParams {
  query?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

