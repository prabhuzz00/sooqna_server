import mongoose from "mongoose";
const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  otp: String,
  otpExpires: Date,
});
export default mongoose.model("PendingUser", pendingUserSchema);
