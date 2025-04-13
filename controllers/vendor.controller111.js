// controllers/vendor.controller.js
import Vendor from "../models/vendor.model.js";
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs/promises";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { request } from "http";
import jwt from "jsonwebtoken";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

//image upload
var imagesArr = [];
export async function uploadImages(request, response) {
  try {
    imagesArr = [];

    const image = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image?.length; i++) {
      const img = await cloudinary.uploader.upload(
        image[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${request.files[i].filename}`);
        }
      );
    }

    return response.status(200).json({
      images: imagesArr,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

var bannerImage = [];
export async function uploadBannerImages(request, response) {
  try {
    bannerImage = [];

    const image = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image?.length; i++) {
      const img = await cloudinary.uploader.upload(
        image[i].path,
        options,
        function (error, result) {
          bannerImage.push(result.secure_url);
          fs.unlinkSync(`uploads/${request.files[i].filename}`);
        }
      );
    }

    return response.status(200).json({
      images: bannerImage,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

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

    let storeLogoUrl = imagesArr;
    let storeBannerUrl = bannerImage;

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

// Login Vendor
const loginVendor = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and password are required",
      });
    }

    const vendor = await Vendor.findOne({ emailAddress });
    if (!vendor) {
      return res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
    }

    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { vendorId: vendor._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    const vendorData = vendor.toObject();
    delete vendorData.password;

    return res.status(200).json({
      error: false,
      message: "Login successful",
      token,
      vendor: vendorData,
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    return res.status(500).json({
      error: true,
      message: "Server error: " + error.message,
    });
  }
};
//end login vendor

//vendor login w email n pass w hash
export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "User not register",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact to admin",
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      return response.status(400).json({
        message: "Your Email is not verify yet please verify your email first",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return response.status(400).json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await genertedRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", accesstoken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

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

export {
  createVendor,
  getVendors,
  verifyVendor,
  editVendor,
  deleteVendor,
  updateVendorStatus,
  loginVendor,
};
