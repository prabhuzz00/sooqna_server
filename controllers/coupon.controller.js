import CouponModels from "../models/coupon.model.js";
import OrderModel from "../models/order.model.js";

// Create a new coupon
export const createCoupon = async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      code: req.body.code.toUpperCase(),
    };
    const coupon = new CouponModels(couponData);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const coupon = await CouponModels.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Validate a coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.userId; // Use req.userId from original middleware

    if (!code || !orderAmount) {
      return res
        .status(400)
        .json({ error: "Code and order amount are required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "User authentication required" });
    }

    const coupon = await CouponModels.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    // Check per-user usage limit
    if (coupon.maxUserUsage) {
      const userUsage = coupon.userUsage.find(
        (usage) => usage.userId.toString() === userId.toString()
      );
      if (userUsage && userUsage.usageCount >= coupon.maxUserUsage) {
        return res
          .status(400)
          .json({ error: "You have reached the usage limit for this coupon" });
      }
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res
        .status(400)
        .json({ error: `Minimum order amount is ${coupon.minOrderAmount}` });
    }

    let discount =
      coupon.discountType === "percentage"
        ? orderAmount * (coupon.discountValue / 100)
        : coupon.discountValue;

    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    res.status(200).json({
      discount,
      couponId: coupon._id,
      message: "Coupon applied successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// List all coupons (with pagination and filtering)
export const listCoupons = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const coupons = await CouponModels.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await CouponModels.countDocuments(query);

    res.status(200).json({
      coupons,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await CouponModels.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Increment coupon usage
export const incrementCouponUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Assuming auth middleware provides user ID

    if (!userId) {
      return res.status(401).json({ error: "User authentication required" });
    }

    const coupon = await CouponModels.findById(id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    // Check per-user usage limit
    if (coupon.maxUserUsage) {
      const userUsage = coupon.userUsage.find(
        (usage) => usage.userId.toString() === userId.toString()
      );
      if (userUsage && userUsage.usageCount >= coupon.maxUserUsage) {
        return res
          .status(400)
          .json({ error: "You have reached the usage limit for this coupon" });
      }
    }

    // Increment total usage
    coupon.usedCount += 1;

    // Increment user-specific usage
    const userUsage = coupon.userUsage.find(
      (usage) => usage.userId.toString() === userId.toString()
    );
    if (userUsage) {
      userUsage.usageCount += 1;
    } else {
      coupon.userUsage.push({ userId, usageCount: 1 });
    }

    await coupon.save();

    res.status(200).json({ message: "Coupon usage updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// coupon usage summary
export const getCouponSummary = async (req, res) => {
  try {
    // Aggregate coupon usage: unique users and total usage count
    const couponUsage = await CouponModels.aggregate([
      {
        $project: {
          code: { $toUpper: "$code" }, // Normalize to uppercase
          uniqueUsers: { $size: "$userUsage" }, // Count unique userIds
          totalUsages: { $sum: "$userUsage.usageCount" }, // Sum usageCount
        },
      },
    ]);

    // Aggregate purchase value from orders per coupon
    const orderValues = await OrderModel.aggregate([
      {
        $match: {
          couponCode: { $exists: true, $ne: null, $ne: "" }, // Orders with couponCode
        },
      },
      {
        $group: {
          _id: { $toUpper: "$couponCode" }, // Normalize to uppercase
          totalPurchaseValue: { $sum: "$totalAmt" }, // Sum totalAmt
          totalDiscountValue: { $sum: "$couponDiscount" },
          orderCount: { $sum: 1 }, // Count orders
        },
      },
      {
        $project: {
          code: "$_id",
          totalPurchaseValue: 1,
          totalDiscountValue: 1,
          orderCount: 1,
          _id: 0,
        },
      },
    ]);

    // Merge results
    const summary = couponUsage.map((coupon) => {
      const orderData = orderValues.find((o) => o.code === coupon.code) || {
        totalPurchaseValue: 0,
        totalDiscountValue: 0,
        orderCount: 0,
      };
      return {
        code: coupon.code,
        uniqueUsers: coupon.uniqueUsers,
        totalUsages: coupon.totalUsages,
        totalPurchaseValue: orderData.totalPurchaseValue,
        totalDiscountValue: orderData.totalDiscountValue,
        orderCount: orderData.orderCount,
      };
    });

    console.log("getCouponSummary - Summary:", summary);

    res.status(200).json({
      success: true,
      data: summary,
      message: "Coupon summary retrieved successfully",
    });
  } catch (error) {
    console.error("getCouponSummary - Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve coupon summary: " + error.message,
    });
  }
};
