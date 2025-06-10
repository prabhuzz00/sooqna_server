import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    arbName: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    arbDescription: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    catName: {
      type: String,
      default: "",
    },
    catId: {
      type: String,
      default: "",
    },
    subCatId: {
      type: String,
      default: "",
    },
    subCat: {
      type: String,
      default: "",
    },
    thirdsubCat: {
      type: String,
      default: "",
    },
    thirdsubCatId: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    countInStock: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      required: true,
    },
    sale: {
      type: Number,
      default: 0,
    },

    bannerimages: [
      {
        type: String,
        required: true,
      },
    ],
    bannerTitleName: {
      type: String,
      default: "",
    },
    isDisplayOnHomeBanner: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
    },
    rejectReson: {
      type: String,
      default: "",
    },
    isReturn: {
      type: Boolean,
      default: false,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    barcode: {
      type: String,
    },

    variation: [
      {
        color: {
          label: { type: String, required: true },
          images: [{ type: String, required: true }],
        },
        sizes: [
          {
            label: { type: String, required: true },
            price: { type: Number, required: true },
            countInStock: { type: Number, required: true },
            vbarcode: { type: String },
          },
        ],
      },
    ],

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
