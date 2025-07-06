import mongoose from "mongoose";

const addressSchema = mongoose.Schema(
  {
    address_line1: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    area: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
    },
    country: {
      type: String,
    },
    mobile: {
      type: Number,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    selected: {
      type: Boolean,
      default: true,
    },
    landmark: {
      type: String,
    },
    addressType: {
      type: String,
    },
    userId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const AddressModel = mongoose.model("address", addressSchema);

export default AddressModel;
