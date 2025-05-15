import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.ObjectId,
      ref: "Vendor",
    },
    withdrawal_amt: {
      type: Number,
      required: true,
    },
    withdrawal_status: {
      type: String,
      default: "Pending",
    },
    bank_details: {
      type: mongoose.Schema.ObjectId,
      ref: "bank",
    },
  },
  {
    timestamps: true,
  }
);

const withdrawalModel = mongoose.model("withdrawal", withdrawalSchema);

export default withdrawalModel;
