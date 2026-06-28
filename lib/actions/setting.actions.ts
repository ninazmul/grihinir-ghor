"use server";

import { handleError, sanitizeSetting } from "../utils";
import { connectToDatabase } from "../database";

import Setting, { ISetting, ISettingSafe } from "../database/models/setting.model";

import { SettingParams } from "@/types";

// ====================
// Cache
// ====================

let cachedSetting: ISettingSafe | null = null;
let cacheTimestamp = 0;

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// ====================
// Default Setting
// ====================

const DEFAULT_SETTING: Partial<ISetting> = {
  branding: {
    storeName: "",
    logo: "",
    favicon: "",
    tagline: "",
    description: "",
  },

  contact: {
    email: "",
    phoneNumber: "",
    whatsapp: "",
    address: "",
  },

  socials: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    facebookGroup: "",
    linkedin: "",
    tiktok: "",
  },

  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    ogImage: "",
  },

  hero: {
    images: [],
  },

  policies: {
    returnPolicy: "",
    privacyPolicy: "",
    termsOfService: "",
  },

  faqs: {
    badge: "",
    title: "",
    description: "",
    items: [],
  },

  analytics: {
    facebookPixelId: "",
  },
};

// ====================
// Create Setting
// ====================

export const createSetting = async (
  params: SettingParams,
): Promise<ISettingSafe | null> => {
  try {
    await connectToDatabase();

    const existing = await Setting.findOne();

    if (existing) {
      throw new Error("Settings already exist");
    }

    const setting = await Setting.create(params);

    cachedSetting = sanitizeSetting(setting.toObject());
    cacheTimestamp = Date.now();

    return structuredClone(cachedSetting);
  } catch (error) {
    handleError(error);
    return null;
  }
};

// ====================
// Get Setting
// ====================

export const getSetting = async (): Promise<ISettingSafe | null> => {
  try {
    const now = Date.now();

    if (cachedSetting && now - cacheTimestamp < CACHE_TTL) {
      return structuredClone(cachedSetting);
    }

    await connectToDatabase();

    let setting = await Setting.findOne().lean<ISetting>();

    if (!setting) {
      setting = await Setting.findOneAndUpdate(
        {},
        {
          $setOnInsert: DEFAULT_SETTING,
        },
        {
          upsert: true,
          new: true,
          lean: true,
        },
      );
    }

    if (!setting) {
      return null;
    }

    cachedSetting = sanitizeSetting(setting);
    cacheTimestamp = now;

    return structuredClone(cachedSetting);
  } catch (error) {
    handleError(error);
    return null;
  }
};

// ====================
// Update Setting
// ====================

export const upsertSetting = async (
  updateData: Partial<SettingParams>,
): Promise<ISettingSafe | null> => {
  try {
    await connectToDatabase();

    const setting = await Setting.findOneAndUpdate(
      {},
      {
        $set: updateData,
        $setOnInsert: DEFAULT_SETTING,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        lean: true,
      },
    );

    if (!setting) {
      return null;
    }

    cachedSetting = sanitizeSetting(setting as ISetting);
    cacheTimestamp = Date.now();

    return structuredClone(cachedSetting);
  } catch (error) {
    handleError(error);
    return null;
  }
};

// ====================
// Clear Cache
// ====================

export const clearSettingCache = async (): Promise<void> => {
  cachedSetting = null;
  cacheTimestamp = 0;
};
