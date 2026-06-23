import { Document, Schema, Types, model, models } from "mongoose";

export interface IFaqItem {
  question: string;
  answer: string;
}

export interface ISetting extends Document {
  _id: Types.ObjectId;

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

const FaqItemSchema = new Schema<IFaqItem>(
  {
    question: {
      type: String,
      trim: true,
      default: "",
    },
    answer: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const SettingSchema = new Schema<ISetting>(
  {
    branding: {
      type: {
        storeName: {
          type: String,
          trim: true,
          default: "",
        },
        logo: {
          type: String,
          trim: true,
          default: "",
        },
        favicon: {
          type: String,
          trim: true,
          default: "",
        },
        tagline: {
          type: String,
          trim: true,
          default: "",
        },
        description: {
          type: String,
          trim: true,
          default: "",
        },
      },
      default: {},
    },

    contact: {
      type: {
        email: {
          type: String,
          trim: true,
          lowercase: true,
          default: "",
        },
        phoneNumber: {
          type: String,
          trim: true,
          default: "",
        },
        whatsapp: {
          type: String,
          trim: true,
          default: "",
        },
        address: {
          type: String,
          trim: true,
          default: "",
        },
      },
      default: {},
    },

    socials: {
      type: {
        facebook: {
          type: String,
          trim: true,
          default: "",
        },
        instagram: {
          type: String,
          trim: true,
          default: "",
        },
        twitter: {
          type: String,
          trim: true,
          default: "",
        },
        youtube: {
          type: String,
          trim: true,
          default: "",
        },
        facebookGroup: {
          type: String,
          trim: true,
          default: "",
        },
        linkedin: {
          type: String,
          trim: true,
          default: "",
        },
        tiktok: {
          type: String,
          trim: true,
          default: "",
        },
      },
      default: {},
    },

    seo: {
      type: {
        metaTitle: {
          type: String,
          trim: true,
          default: "",
        },
        metaDescription: {
          type: String,
          trim: true,
          default: "",
        },
        metaKeywords: {
          type: [String],
          default: [],
        },
        ogImage: {
          type: String,
          trim: true,
          default: "",
        },
      },
      default: {},
    },

    hero: {
      type: {
        images: {
          type: [String],
          default: [],
        },
      },
      default: {},
    },

    policies: {
      type: {
        returnPolicy: {
          type: String,
          default: "",
        },
        privacyPolicy: {
          type: String,
          default: "",
        },
        termsOfService: {
          type: String,
          default: "",
        },
      },
      default: {},
    },

    faqs: {
      type: {
        badge: {
          type: String,
          trim: true,
          default: "",
        },
        title: {
          type: String,
          trim: true,
          default: "",
        },
        description: {
          type: String,
          trim: true,
          default: "",
        },
        items: {
          type: [FaqItemSchema],
          default: [],
        },
      },
      default: {},
    },

    analytics: {
      type: {
        facebookPixelId: {
          type: String,
          trim: true,
          default: "",
        },
      },
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Setting = models.Setting || model<ISetting>("Setting", SettingSchema);

export default Setting;
