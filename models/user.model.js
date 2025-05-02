import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Provide name"],
    },
    email: {
      type: String,
      required: [true, "Provide email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Provide password"],
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: Number,
      required: [true, "Provide Phone Number"],
      unique: true,
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    access_token: {
      type: String,
      default: "",
    },
    refresh_token: {
      type: String,
      default: "",
    },
    last_login_date: {
      type: Date,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    address_details: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "address",
      },
    ],
    orderHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "order",
      },
    ],
    // otp: {
    //   type: String,
    // },
    // otpExpires: {
    //   type: Date,
    // },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    signUpWithGoogle: {
      type: Boolean,
      default: false,
    },
    locationPermission: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        default: 'Point'
      },
      coordinates: {
        type: [Number], // Array of numbers for longitude and latitude
        default: [0, 0] // Default coordinates [longitude, latitude]
      }
    },
  },
  { timestamps: true }
);

// Add 2dsphere index for efficient geospatial queries
userSchema.index({ currentLocation: '2dsphere' });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
