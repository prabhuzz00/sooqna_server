import { Router } from "express";

import {
  createCoupon,
  deleteCoupon,
  incrementCouponUsage,
  listCoupons,
  updateCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";
import auth from "../middlewares/auth.js";

const couponRouter = Router();

// Create a new coupon (Admin only)
couponRouter.post("/create", createCoupon);

// Validate a coupon (Public, rate-limited)
couponRouter.post("/validate", validateCoupon);

// List all coupons (Admin only, with pagination)
couponRouter.get("/", listCoupons);

// Update a coupon (Admin only)
couponRouter.put("/:id", auth, updateCoupon);

// Delete a coupon (Admin only)
couponRouter.delete("/:id", auth, deleteCoupon);

// Increment coupon usage (Order-based authentication)
couponRouter.post("/:id/use", auth, incrementCouponUsage);

export default couponRouter;
