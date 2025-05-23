import CouponModels from "../models/coupon.model.js";

// Create a new coupon
export const createCoupon = async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      code: req.body.code.toUpperCase(), // Ensure code is uppercase
    };
    const coupon = new CouponModels(couponData);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Validate a coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res
        .status(400)
        .json({ error: "Code and order amount are required" });
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
    const coupon = await CouponModels.findById(id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({ message: "Coupon usage updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
