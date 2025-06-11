import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: String,
        },
        name: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        selectedColor: {
          type: String,
        },
        size: {
          type: String,
        },
        price: {
          type: Number,
        },
        image: {
          type: String,
        },
        subTotal: {
          type: Number,
        },
        vendorId: {
          type: String,
        },
        isReturn : {
          type: Boolean,
          required : false,
        }
      },
    ],
    paymentId: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      default: "",
    },
    order_status: {
      type: String,
      default: "Pending",
    },
    statusHistory: [
      {
        status: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
    },
    couponCode: {
      type: String,
    },
    couponDiscount: {
      type: Number,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    barcode: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    pickupPoint: {
      type: String,
      default: null,
    },
    deliveryBoyId: {
      type: mongoose.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },
    deliveryStatus: {
      type: String,
      default: "Picked",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
