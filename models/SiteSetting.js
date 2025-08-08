import mongoose from "mongoose";

const SiteSettingSchema = new mongoose.Schema(
  {
    siteTitle: { type: String },
    email: { type: String },
    contactNo: { type: String },
    logo: { type: String }, // path to uploaded logo
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    popularProductHeadingEn: { type: String },
    popularProductHeadingAr: { type: String },

    addressLine1: { type: String },
    addressLine2: { type: String },
    addressLine3: { type: String },
    addressLine1ar: { type: String },
    addressLine2ar: { type: String },
    addressLine3ar: { type: String },

    workingHourL1: { type: String },
    workingHourL2: { type: String },
    workingHourL3: { type: String },

    workingHourL1ar: { type: String },
    workingHourL2ar: { type: String },
    workingHourL3ar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSetting ||
  mongoose.model("SiteSetting", SiteSettingSchema);
