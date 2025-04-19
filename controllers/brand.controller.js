import Brand from "../models/brand.model.js"; // Changed to ES Modules import

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import brandModel from "../models/brand.model.js";

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

//create brand
export async function createBrand(request, response) {
  try {
    let brand = new brandModel({
      name: request.body.name,
      images: imagesArr,
      is_featured: request.body.is_featured,
      status: request.body.status,
    });

    if (!brand) {
      return response.status(500).json({
        message: "brand not created",
        error: true,
        success: false,
      });
    }

    brand = await brand.save();

    imagesArr = [];

    return response.status(200).json({
      message: "brand created",
      error: false,
      success: true,
      brand: brand,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json({
      error: false,
      data: brands,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

export const getBrandsCount = async (req, res) => {
  try {
    const count = await Brand.countDocuments();
    res.status(200).json({
      error: false,
      data: count,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        error: true,
        message: "Brand not found",
      });
    }
    res.status(200).json({
      error: false,
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

export const updatedBrand = async (req, res) => {
  try {
    const { name, logo, is_featured, status } = req.body;
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        error: true,
        message: "Brand not found",
      });
    }

    if (name) brand.name = name;
    if (logo) brand.logo = logo;
    if (is_featured !== undefined) brand.is_featured = is_featured;
    if (status) brand.status = status;

    const updatedBrand = await brand.save();

    res.status(200).json({
      error: false,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        error: true,
        message: "Brand not found",
      });
    }

    // Delete logo from Cloudinary if it exists
    if (brand.logo) {
      const publicId = brand.logo.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await brand.deleteOne(); // Updated from .remove() to .deleteOne() for consistency

    res.status(200).json({
      error: false,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || "Failed to delete brand",
    });
  }
};

export async function removeImageFromCloudinary(request, response) {
  const imgUrl = request.query.img;

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  if (imageName) {
    const res = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {
        // console.log(error, res)
      }
    );

    if (res) {
      response.status(200).send(res);
    }
  }
}
