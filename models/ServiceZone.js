import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  doorStep: { type: Boolean, default: false }, // ✅ Added
});

const serviceZoneSchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true },
  areas: [areaSchema], // Now supports per-area doorstep toggle
});

const ServiceZone = mongoose.model("ServiceZone", serviceZoneSchema);

export default ServiceZone;
