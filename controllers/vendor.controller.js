// controllers/vendor.controller.js
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Vendor from "../models/vendor.model.js";
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs/promises";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import genertedRefreshToken from "../utils/generatedRefreshToken.js";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { request } from "http";

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
      balance: 0,
      storeLogo: imagesArr,
      storeBanner: bannerImage,
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
      storeLogo: imagesArr,
      storeBanner: bannerImage,
      storeAddress,
      productCategories: productCategories
        ? JSON.parse(productCategories)
        : undefined,
      // commissionRate: commissionRate ? Number(commissionRate) : undefined,
      paymentDetails,
      taxIdentificationNumber,
      termsAgreement: termsAgreement === "true" || termsAgreement === true,
      isVerified: isVerified === "true" || isVerified === true,
      status: status === "true" || status === true,
    };

    // if (req.files?.storeLogo) {
    //   const logoResult = await cloudinary.uploader.upload(
    //     req.files.storeLogo.tempFilePath,
    //     {
    //       folder: "vendor_logos",
    //     }
    //   );
    //   updateData.storeLogo = logoResult.secure_url;
    //   await fs.unlink(req.files.storeLogo.tempFilePath);
    // }

    // if (req.files?.storeBanner) {
    //   const bannerResult = await cloudinary.uploader.upload(
    //     req.files.storeBanner.tempFilePath,
    //     {
    //       folder: "vendor_banners",
    //     }
    //   );
    //   updateData.storeBanner = bannerResult.secure_url;
    //   await fs.unlink(req.files.storeBanner.tempFilePath);
    // }

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
async function loginVendor(request, response) {
  try {
    const { email, password } = request.body;
    console.log("email : ", email);
    const vendor = await Vendor.findOne({ emailAddress: email });
    console.log("vendor : ", vendor);
    if (!vendor) {
      return response.status(400).json({
        message: "User not register",
        error: true,
        success: false,
      });
    }

    if (vendor.status !== true) {
      return response.status(400).json({
        message: "Your status is not active",
        error: true,
        success: false,
      });
    }

    if (vendor.isVerified !== true) {
      return response.status(400).json({
        message: "Your Email is not verify yet please verify your email first",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, vendor.password);

    if (!checkPassword) {
      return response.status(400).json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(vendor._id);
    const refreshToken = await genertedRefreshToken(vendor._id);

    // const updateUser = await UserModel.findByIdAndUpdate(vendor?._id, {
    //     last_login_date: new Date()
    // })

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
        vendorId: vendor._id,
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

//get login user details
async function vendorDetails(request, response) {
  try {
    const vendorId = request.vendorId;

    const vendor = await Vendor.findById(vendorId).select(
      "-password -refresh_token"
    );

    return response.json({
      message: "user details",
      data: vendor,
      error: false,
      success: true,
    });
  } catch (error) {
    console.log("error in vendor details : ", error);
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

//logout
async function logoutVendor(request, response) {
  try {
    const vendorId = request.vendorId; //middleware

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await Vendor.findByIdAndUpdate(vendorId, {
      refresh_token: "",
    });

    return response.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export {
  createVendor,
  getVendors,
  verifyVendor,
  editVendor,
  deleteVendor,
  updateVendorStatus,
  loginVendor,
  logoutVendor,
  vendorDetails,
};
