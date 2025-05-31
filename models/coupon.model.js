// import mongoose from "mongoose";

// const couponSchema = new mongoose.Schema(
//   {
//     code: {
//       type: String,
//       required: [true, "Coupon code is required"],
//       unique: true,
//       uppercase: true,
//       trim: true,
//       minlength: [3, "Coupon code must be at least 3 characters"],
//       maxlength: [20, "Coupon code cannot exceed 20 characters"],
//     },
//     discountType: {
//       type: String,
//       required: [true, "Discount type is required"],
//       enum: {
//         values: ["percentage", "fixed"],
//         message: "Discount type must be either percentage or fixed",
//       },
//     },
//     discountValue: {
//       type: Number,
//       required: [true, "Discount value is required"],
//       min: [0, "Discount value cannot be negative"],
//       validate: {
//         validator: function (value) {
//           return this.discountType === "percentage"
//             ? value <= 100
//             : value <= 10000;
//         },
//         message:
//           'Discount value too high for {PATH}: {VALUE} (max {this.discountType === "percentage" ? 100 : 10000})',
//       },
//     },
//     minOrderAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Minimum order amount cannot be negative"],
//     },
//     maxDiscountAmount: {
//       type: Number,
//       min: [0, "Maximum discount amount cannot be negative"],
//       default: null,
//     },
//     expiryDate: {
//       type: Date,
//       required: [true, "Expiry date is required"],
//     },
//     usageLimit: {
//       type: Number,
//       min: [1, "Usage limit must be at least 1"],
//       default: null,
//     },
//     usedCount: {
//       type: Number,
//       default: 0,
//       min: [0, "Used count cannot be negative"],
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const CouponModels = mongoose.model("Coupon", couponSchema);

// export default CouponModels;

// coupon.model.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    discountType: {
      type: String,
      required: [true, "Discount type is required"],
      enum: {
        values: ["percentage", "fixed"],
        message: "Discount type must be either percentage or fixed",
      },
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator: function (value) {
          return this.discountType === "percentage"
            ? value <= 100
            : value <= 10000;
        },
        message:
          'Discount value too high for {PATH}: {VALUE} (max {this.discountType === "percentage" ? 100 : 10000})',
      },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, "Maximum discount amount cannot be negative"],
      default: null,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUserUsage: {
      type: Number,
      min: [1, "Maximum user usage must be at least 1"],
      default: null, // null means no per-user limit
    },
    userUsage: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        usageCount: {
          type: Number,
          default: 0,
          min: [0, "Usage count cannot be negative"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CouponModels = mongoose.model("Coupon", couponSchema);

export default CouponModels;
