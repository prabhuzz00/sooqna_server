import mongoose from "mongoose";

const bankAcSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendorId",
    },
    bankName: {
      type: String,
      required: true,
    },
    ACNumber: {
      type: BigInt64Array,
      required: true,
    },
    IFSC: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("bankAc", bankAcSchema);
