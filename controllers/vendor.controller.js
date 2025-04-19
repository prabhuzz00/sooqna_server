// controllers/vendor.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Vendor from "../models/vendor.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

const createVendor = async (req, res) => {
  try {
    const {
      storeName,
      storeDescription,
      ownerName,
      emailAddress,
      password, // New field
      phoneNumber,
      storeAddress,
      productCategories,
      commissionRate,
      paymentDetails,
      taxIdentificationNumber,
      termsAgreement,
      isVerified,
      status,
    } = req.body;

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        error: true,
        message: "Password is required and must be at least 6 characters long",
      });
    }

    let storeLogoUrl = "";
    let storeBannerUrl = "";

    if (req.files?.storeLogo) {
      const logoResult = await cloudinary.uploader.upload(
        req.files.storeLogo.tempFilePath,
        {
          folder: "vendor_logos",
        }
      );
      storeLogoUrl = logoResult.secure_url;
      await fs.unlink(req.files.storeLogo.tempFilePath);
    }

    if (req.files?.storeBanner) {
      const bannerResult = await cloudinary.uploader.upload(
        req.files.storeBanner.tempFilePath,
        {
          folder: "vendor_banners",
        }
      );
      storeBannerUrl = bannerResult.secure_url;
      await fs.unlink(req.files.storeBanner.tempFilePath);
    }

    const vendor = new Vendor({
      storeName,
      storeDescription,
      ownerName,
      emailAddress,
      password, // Will be hashed by pre-save hook
      phoneNumber,
      storeAddress,
      storeLogo: storeLogoUrl,
      storeBanner: storeBannerUrl,
      productCategories: JSON.parse(productCategories || "[]"),
      commissionRate: Number(commissionRate),
      paymentDetails,
      taxIdentificationNumber,
      termsAgreement: termsAgreement === "true" || termsAgreement === true,
      isVerified: isVerified === "true" || isVerified === true,
      status: status === "true" || status === true,
    });

    await vendor.save();

    // Exclude password from response
    const vendorResponse = vendor.toObject();
    delete vendorResponse.password;

    res.status(201).json({
      error: false,
      message: "Vendor created successfully",
      data: vendorResponse,
    });
  } catch (error) {
    console.error("Create vendor error:", error);
    if (error.code === 11000) {
      res
        .status(400)
        .json({ error: true, message: "Email address already exists" });
    } else {
      res
        .status(500)
        .json({ error: true, message: "Server error: " + error.message });
    }
  }
};

const getVendors = async (req, res) => {
  try {
    const { page = 1, limit = 25, isVerified, id } = req.query;

    const query = {};
    if (isVerified !== undefined) {
      query.isVerified = isVerified === "true";
    }
    if (id) {
      query._id = id;
    }

    const vendors = await Vendor.find(query, { password: 0 }) // Exclude password
      .skip(id ? 0 : (page - 1) * limit)
      .limit(id ? 1 : parseInt(limit));

    const totalVendors = await Vendor.countDocuments(query);

    res.status(200).json({
      error: false,
      success: true,
      vendors,
      total: vendors.length,
      page: parseInt(page),
      totalPages: id ? 1 : Math.ceil(totalVendors / limit),
      totalVendorsCount: totalVendors,
    });
  } catch (error) {
    console.error("Get vendors error:", error);
    res
      .status(500)
      .json({ error: true, message: "Server error: " + error.message });
  }
};

const verifyVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true, select: "-password" } // Exclude password
    );

    if (!vendor) {
      return res.status(404).json({ error: true, message: "Vendor not found" });
    }

    res.status(200).json({
      error: false,
      message: "Vendor verified successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Verify vendor error:", error);
    res
      .status(500)
      .json({ error: true, message: "Server error: " + error.message });
  }
};

const editVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      storeName,
      storeDescription,
      ownerName,
      emailAddress,
      phoneNumber,
      storeAddress,
      productCategories,
      commissionRate,
      paymentDetails,
      taxIdentificationNumber,
      termsAgreement,
      isVerified,
      status,
    } = req.body; // Removed password

    let updateData = {
      storeName,
      storeDescription,
      ownerName,
      emailAddress,
      phoneNumber,
      storeAddress,
      productCategories: productCategories
        ? JSON.parse(productCategories)
        : undefined,
      commissionRate: commissionRate ? Number(commissionRate) : undefined,
      paymentDetails,
      taxIdentificationNumber,
      termsAgreement: termsAgreement === "true" || termsAgreement === true,
      isVerified: isVerified === "true" || isVerified === true,
      status: status === "true" || status === true,
    };

    if (req.files?.storeLogo) {
      const logoResult = await cloudinary.uploader.upload(
        req.files.storeLogo.tempFilePath,
        {
          folder: "vendor_logos",
        }
      );
      updateData.storeLogo = logoResult.secure_url;
      await fs.unlink(req.files.storeLogo.tempFilePath);
    }

    if (req.files?.storeBanner) {
      const bannerResult = await cloudinary.uploader.upload(
        req.files.storeBanner.tempFilePath,
        {
          folder: "vendor_banners",
        }
      );
      updateData.storeBanner = bannerResult.secure_url;
      await fs.unlink(req.files.storeBanner.tempFilePath);
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    console.log("Update data:", updateData);

    const vendor = await Vendor.findByIdAndUpdate(id, updateData, {
      new: true,
      select: "-password",
    });

    if (!vendor) {
      return res.status(404).json({ error: true, message: "Vendor not found" });
    }

    res.status(200).json({
      error: false,
      message: "Vendor updated successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Edit vendor error:", error);
    if (error.code === 11000) {
      res
        .status(400)
        .json({ error: true, message: "Email address already exists" });
    } else {
      res
        .status(500)
        .json({ error: true, message: "Server error: " + error.message });
    }
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByIdAndDelete(id);

    if (!vendor) {
      return res.status(404).json({ error: true, message: "Vendor not found" });
    }

    res.status(200).json({
      error: false,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Delete vendor error:", error);
    res
      .status(500)
      .json({ error: true, message: "Server error: " + error.message });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ error: true, message: "Vendor not found" });
    }

    const newStatus = !vendor.status;
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true, select: "-password" } // Exclude password
    );

    res.status(200).json({
      error: false,
      message: `Vendor ${newStatus ? "activated" : "deactivated"} successfully`,
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res
      .status(500)
      .json({ error: true, message: "Server error: " + error.message });
  }
};

//login
const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and password are required",
      });
    }
    const vendors = await Vendor.find();
    console.log("vendors :");
    const vendor = await Vendor.findOne({ emailAddress: email });

    if (!vendor) {
      return res.status(404).json({
        error: true,
        message: "Vendor not found",
      });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);

    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: vendor._id, role: "vendor" },
      process.env.SECRET_KEY_ACCESS_TOKEN,
      {
        expiresIn: "7d",
      }
    );

    const vendorData = vendor.toObject();
    delete vendorData.password;
    console.log("vendor data : ", vendorData);
    res.status(200).json({
      error: false,
      message: "Login successful",
      token,
      data: vendorData,
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    res
      .status(500)
      .json({ error: true, message: "Server error: " + error.message });
  }
};

export {
  createVendor,
  getVendors,
  verifyVendor,
  editVendor,
  deleteVendor,
  updateVendorStatus,
  loginVendor,
};
