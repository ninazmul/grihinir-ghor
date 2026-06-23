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
