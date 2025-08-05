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
  },
  { timestamps: true }
);

export default mongoose.models.SiteSetting ||
  mongoose.model("SiteSetting", SiteSettingSchema);
