// import mongoose from "mongoose";

// const productSchema = mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     arbName: {
//       type: String,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     arbDescription: {
//       type: String,
//       required: true,
//     },
//     images: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//     brand: {
//       type: String,
//       default: "",
//     },
//     price: {
//       type: Number,
//       default: 0,
//     },
//     oldPrice: {
//       type: Number,
//       default: 0,
//     },
//     catName: {
//       type: String,
//       default: "",
//     },
//     catId: {
//       type: String,
//       default: "",
//     },
//     subCatId: {
//       type: String,
//       default: "",
//     },
//     subCat: {
//       type: String,
//       default: "",
//     },
//     thirdsubCat: {
//       type: String,
//       default: "",
//     },
//     thirdsubCatId: {
//       type: String,
//       default: "",
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//     },
//     countInStock: {
//       type: Number,
//       required: true,
//     },
//     rating: {
//       type: Number,
//       default: 0,
//     },
//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//     discount: {
//       type: Number,
//       required: true,
//     },
//     sale: {
//       type: Number,
//       default: 0,
//     },

//     bannerimages: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//     bannerTitleName: {
//       type: String,
//       default: "",
//     },
//     isDisplayOnHomeBanner: {
//       type: Boolean,
//       default: false,
//     },
//     isVerified: {
//       type: Boolean,
//     },
//     rejectReson: {
//       type: String,
//       default: "",
//     },
//     verifyStatus: {
//       type: String,
//     },
//     isReturn: {
//       type: Boolean,
//       default: false,
//     },
//     vendorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       default: null,
//     },
//     serviceZone : {
//       type : String,
//     },
//     barcode: {
//       type: String,
//     },

//     variation: [
//       {
//         color: {
//           label: { type: String,  },
//           images: [{ type: String, required: true }],
//         },
//         sizes: [
//           {
//             label: { type: String,  },
//             price: { type: Number, required: true },
//             countInStock: { type: Number, required: true },
//             vbarcode: { type: String },
//           },
//         ],
//       },
//     ],

//     tags: {
//       type: [String],
//       default: [],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const ProductModel = mongoose.model("Product", productSchema);

// export default ProductModel;


import mongoose from "mongoose";

// Add schema-level indexes for fast queries
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
    // Store category name (and arabic name) directly for home/listing rendering
    catId: {
      type: String,
      default: "",
      index: true, // Add index for fast queries
    },
    catName: {
      type: String,
      default: "",
    },
    catNameAr: {              // <-- Add Arabic category name directly
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
    // Optionally, you can remove this if you never need full populate in frontend
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      select: false, // Don't include by default
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
      index: true, // Index for fast queries
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
      index: true, // Index for fast queries
    },
    rejectReson: {
      type: String,
      default: "",
    },
    verifyStatus: {
      type: String,
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
    serviceZone: {
      type: String,
    },
    barcode: {
      type: String,
    },

    variation: [
      {
        color: {
          label: { type: String },
          images: [{ type: String, required: true }],
        },
        sizes: [
          {
            label: { type: String },
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

// Compound indexes for common filtered queries (optional, highly recommended)
productSchema.index({ catId: 1, isVerified: 1 });
productSchema.index({ isFeatured: 1, isVerified: 1 });
productSchema.index({ createdAt: -1, isVerified: 1 });

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;