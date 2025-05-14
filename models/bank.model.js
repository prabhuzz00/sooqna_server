import mongoose from "mongoose";

const bankSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
    },
    accountNo: {
      type: String,
      default: "",
    },
    IFSC: {
      type: String,
      default: "",
    },
    Branch: {
      type: String,
    },
    bankname: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    vendorId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const BankModel = mongoose.model("bank", bankSchema);

export default BankModel;
