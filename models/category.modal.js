import mongoose from "mongoose";
import { type } from "os";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    arName: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    parentCatName: {
      type: String,
    },
    isAdminCategory: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
