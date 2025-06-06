import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const serviceZoneSchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true },
  areas: [areaSchema],
});

const ServiceZone = mongoose.model("ServiceZone", serviceZoneSchema);

export default ServiceZone;
