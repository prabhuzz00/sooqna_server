// models/vendor.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const vendorSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  storeDescription: { type: String, required: true },
  ownerName: { type: String, required: true },
  emailAddress: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // New field
  phoneNumber: { type: String, required: true },
  availableBalance: { type: Number, default: 0 },
  dueBalance: { type: Number, default: 0 },
  storeAddress: { type: String, required: true },
  storeLogo: [{ type: String }],
  storeBanner: [{ type: String }],
  productCategories: { type: [String], default: [] },
  commissionRate: { type: Number, required: true },
  paymentDetails: { type: String, required: true },
  taxIdentificationNumber: { type: String },
  termsAgreement: { type: Boolean, required: true },
  isVerified: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
vendorSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare passwords (for future login functionality)
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
