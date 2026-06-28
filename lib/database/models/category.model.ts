import { Document, Schema, Types, model, models } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
  },
  {
    timestamps: true,
  }
);

const Category = models.Category || model<ICategory>("Category", CategorySchema);

export default Category;
