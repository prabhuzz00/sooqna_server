import ProductModel from "../models/product.modal.js";
import ProductRAMSModel from "../models/productRAMS.js";
import ProductWEIGHTModel from "../models/productWEIGHT.js";
import ProductSIZEModel from "../models/productSIZE.js";
import { uploadAndTag } from "../utils/cloudService.js";

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

//banner image upload
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

// color image upload
var colorImagesArr = [];

export async function uploadColorImages(request, response) {
  try {
    colorImagesArr = [];

    const images = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images?.length; i++) {
      const result = await cloudinary.uploader.upload(images[i].path, options);
      colorImagesArr.push(result.secure_url);
      fs.unlinkSync(`uploads/${images[i].filename}`);
    }

    return response.status(200).json({
      images: colorImagesArr,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//create product
// export async function createProduct(request, response) {
//   try {
//     let product = new ProductModel({
//       name: request.body.name,
//       arbName: request.body.arbName,
//       description: request.body.description,
//       arbDescription: request.body.arbDescription,
//       images: imagesArr,
//       bannerimages: bannerImage,
//       bannerTitleName: request.body.bannerTitleName,
//       isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
//       brand: request.body.brand,
//       price: request.body.price,
//       oldPrice: request.body.oldPrice,
//       catName: request.body.catName,
//       category: request.body.category,
//       catId: request.body.catId,
//       subCatId: request.body.subCatId,
//       subCat: request.body.subCat,
//       thirdsubCat: request.body.thirdsubCat,
//       thirdsubCatId: request.body.thirdsubCatId,
//       countInStock: request.body.countInStock,
//       rating: request.body.rating,
//       isFeatured: request.body.isFeatured,
//       discount: request.body.discount,
//       productRam: request.body.productRam,
//       size: request.body.size,
//       productWeight: request.body.productWeight,
//       isVerified: request.body.isVerified,
//       vendorId: request.body.vendorId,
//       barcode: request.body.barcode,
//       tags: request.body.tags,
//     });

//     product = await product.save();

//     console.log(product);

//     if (!product) {
//       response.status(500).json({
//         error: true,
//         success: false,
//         message: "Product Not created",
//       });
//     }

//     imagesArr = [];

//     return response.status(200).json({
//       message: "Product Created successfully",
//       error: false,
//       success: true,
//       product: product,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      arbName,
      description,
      arbDescription,
      images,
      brand,
      price,
      oldPrice,
      catName,
      catId,
      subCat,
      subCatId,
      thirdsubCat,
      thirdsubCatId,
      category,
      countInStock,
      rating,
      isFeatured,
      discount,
      sale,
      bannerimages,
      bannerTitleName,
      isDisplayOnHomeBanner,
      isVerified,
      vendorId,
      barcode,
      variation,
      tags,
    } = req.body;

    const newProduct = new ProductModel({
      name,
      arbName,
      description,
      arbDescription,
      images,
      brand,
      price,
      oldPrice,
      catName,
      catId,
      subCat,
      subCatId,
      thirdsubCat,
      thirdsubCatId,
      category,
      countInStock,
      rating,
      isFeatured,
      discount,
      sale,
      bannerimages,
      bannerTitleName,
      isDisplayOnHomeBanner,
      isVerified,
      vendorId,
      barcode,
      variation,
      tags,
    });

    await newProduct.save();
    res.status(200).json({
      error: false,
      success: true,
      product: newProduct,
      message: "Product created Successfully",
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      error: true,
      success: false,
      message: "Product creation failed.",
    });
  }
};

//get all products
export async function getAllProducts(request, response) {
  try {
    const { page, limit } = request.query;
    const totalProducts = await ProductModel.find();

    const products = await ProductModel.find({ isVerified: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ProductModel.countDocuments(products);

    if (!products) {
      return response.status(400).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCount: totalProducts?.length,
      totalProducts: totalProducts,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const verifyProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true, select: "-password" } // Exclude password
    );

    if (!product) {
      return res.status(404).json({ error: true, message: "Vendor not found" });
    }

    res.status(200).json({
      error: false,
      message: "Product verified successfully",
      data: product,
    });
  } catch (error) {
    console.error("Verify product error:", error);
    res
      .status(500)
      .json({ error: true, message: "Server error: " + error.message });
  }
};

//get all products by vendorID where isVerified false
// export async function getAllUnverifyProducts(request, response) {
//   try {
//     const { page, limit } = request.query;
//     const totalProducts = await ProductModel.find();

//     const products = await ProductModel.find({ isVerified: false })
//       .populate("vendorId", "storeName ownerName")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     const total = await ProductModel.countDocuments(products);

//     if (!products) {
//       return response.status(400).json({
//         error: true,
//         success: false,
//       });
//     }

//     return response.status(200).json({
//       error: false,
//       success: true,
//       products: products,
//       total: total,
//       page: parseInt(page),
//       totalPages: Math.ceil(total / limit),
//       totalCount: totalProducts?.length,
//       totalProducts: totalProducts,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

export async function getAllUnverifyProducts(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;

    const query = { isVerified: false };

    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .populate("vendorId", "storeName ownerName") // Only return storeName and ownerName
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return response.status(200).json({
      error: false,
      success: true,
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

// get all products for given vendorId
export async function getAllProductsForVendorId(request, response) {
  try {
    const { vendorId, page = 1, limit = 10 } = request.query;

    // Validate vendorId
    if (!vendorId) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "vendorId is required",
      });
    }

    // Find total products for the given vendorId (excluding null vendorId)
    const totalProducts = await ProductModel.find({
      vendorId: { $eq: vendorId, $ne: null },
    });

    // Find products for the given vendorId with pagination
    const products = await ProductModel.find({
      vendorId: { $eq: vendorId, $ne: null },
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Count total documents for the given vendorId
    const total = await ProductModel.countDocuments({
      vendorId: { $eq: vendorId, $ne: null },
    });

    if (!products || products.length === 0) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "No products found for this vendorId",
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCount: totalProducts.length,
      totalProducts: totalProducts,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "An error occurred",
      error: true,
      success: false,
    });
  }
}

//get all products by category id
// export async function getAllProductsByCatId(request, response) {
//   try {
//     const page = parseInt(request.query.page) || 1;
//     const perPage = parseInt(request.query.perPage) || 10000;

//     const totalPosts = await ProductModel.countDocuments();
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if (page > totalPages) {
//       return response.status(404).json({
//         message: "Page not found",
//         success: false,
//         error: true,
//       });
//     }

//     const products = await ProductModel.find({
//       catId: request.params.id,
//     })
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .exec();

//     if (!products) {
//       response.status(500).json({
//         error: true,
//         success: false,
//       });
//     }

//     return response.status(200).json({
//       error: false,
//       success: true,
//       products: products,
//       totalPages: totalPages,
//       page: page,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

export async function getAllProductsByCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;

    // Count only verified products for the given category
    const totalPosts = await ProductModel.countDocuments({
      catId: request.params.id,
      isVerified: true,
    });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    // Find products where isVerified is true
    const products = await ProductModel.find({
      catId: request.params.id,
      isVerified: true,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "No verified products found for this category",
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all products by category name
export async function getAllProductsByCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      catName: request.query.catName,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all products by sub category id
export async function getAllProductsBySubCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      subCatId: request.params.id,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all products by sub category name
export async function getAllProductsBySubCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      subCat: request.query.subCat,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all products by sub category id
export async function getAllProductsByThirdLavelCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      thirdsubCatId: request.params.id,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all products by sub category name
export async function getAllProductsByThirdLavelCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      thirdsubCat: request.query.thirdsubCat,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all products by price

export async function getAllProductsByPrice(request, response) {
  let productList = [];

  if (request.query.catId !== "" && request.query.catId !== undefined) {
    const productListArr = await ProductModel.find({
      catId: request.query.catId,
    }).populate("category");

    productList = productListArr;
  }

  if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
    const productListArr = await ProductModel.find({
      subCatId: request.query.subCatId,
    }).populate("category");

    productList = productListArr;
  }

  if (
    request.query.thirdsubCatId !== "" &&
    request.query.thirdsubCatId !== undefined
  ) {
    const productListArr = await ProductModel.find({
      thirdsubCatId: request.query.thirdsubCatId,
    }).populate("category");

    productList = productListArr;
  }

  const filteredProducts = productList.filter((product) => {
    if (
      request.query.minPrice &&
      product.price < parseInt(+request.query.minPrice)
    ) {
      return false;
    }
    if (
      request.query.maxPrice &&
      product.price > parseInt(+request.query.maxPrice)
    ) {
      return false;
    }
    return true;
  });

  return response.status(200).json({
    error: false,
    success: true,
    products: filteredProducts,
    totalPages: 0,
    page: 0,
  });
}

//get all products by rating
export async function getAllProductsByRating(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    console.log(request.query.subCatId);

    let products = [];

    if (request.query.catId !== undefined) {
      products = await ProductModel.find({
        rating: request.query.rating,
        catId: request.query.catId,
      })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (request.query.subCatId !== undefined) {
      products = await ProductModel.find({
        rating: request.query.rating,
        subCatId: request.query.subCatId,
      })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (request.query.thirdsubCatId !== undefined) {
      products = await ProductModel.find({
        rating: request.query.rating,
        thirdsubCatId: request.query.thirdsubCatId,
      })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all products count

export async function getProductsCount(request, response) {
  try {
    const productsCount = await ProductModel.countDocuments();

    if (!productsCount) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      productCount: productsCount,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all features products
export async function getAllFeaturedProducts(request, response) {
  try {
    const products = await ProductModel.find({
      isFeatured: true,
    }).populate("category");

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get all features products have banners
export async function getAllProductsBanners(request, response) {
  try {
    const products = await ProductModel.find({
      isDisplayOnHomeBanner: true,
    }).populate("category");

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//delete product
export async function deleteProduct(request, response) {
  const product = await ProductModel.findById(request.params.id).populate(
    "category"
  );

  if (!product) {
    return response.status(404).json({
      message: "Product Not found",
      error: true,
      success: false,
    });
  }

  const images = product.images;

  let img = "";
  for (img of images) {
    const imgUrl = img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
      cloudinary.uploader.destroy(imageName, (error, result) => {
        // console.log(error, result);
      });
    }
  }

  const deletedProduct = await ProductModel.findByIdAndDelete(
    request.params.id
  );

  if (!deletedProduct) {
    response.status(404).json({
      message: "Product not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    success: true,
    error: false,
    message: "Product Deleted!",
  });
}

//delete multiple products
export async function deleteMultipleProduct(request, response) {
  const { ids } = request.body;

  if (!ids || !Array.isArray(ids)) {
    return response
      .status(400)
      .json({ error: true, success: false, message: "Invalid input" });
  }

  for (let i = 0; i < ids?.length; i++) {
    const product = await ProductModel.findById(ids[i]);

    const images = product.images;

    let img = "";
    for (img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];

      const imageName = image.split(".")[0];

      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {
          // console.log(error, result);
        });
      }
    }
  }

  try {
    await ProductModel.deleteMany({ _id: { $in: ids } });
    return response.status(200).json({
      message: "Product delete successfully",
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

//get single product
export async function getProduct(request, response) {
  try {
    const product = await ProductModel.findById(request.params.id).populate(
      "category"
    );

    if (!product) {
      return response.status(404).json({
        message: "The product is not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      product: product,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//delete images
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

//updated product
export async function updateProduct(request, response) {
  try {
    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        subCat: request.body.subCat,
        description: request.body.description,
        arbName: request.body.arbName,
        arbDescription: request.body.arbDescription,
        bannerimages: request.body.bannerimages,
        bannerTitleName: request.body.bannerTitleName,
        isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
        images: request.body.images,
        bannerTitleName: request.body.bannerTitleName,
        brand: request.body.brand,
        price: request.body.price,
        oldPrice: request.body.oldPrice,
        catId: request.body.catId,
        catName: request.body.catName,
        subCat: request.body.subCat,
        subCatId: request.body.subCatId,
        category: request.body.category,
        thirdsubCat: request.body.thirdsubCat,
        thirdsubCatId: request.body.thirdsubCatId,
        countInStock: request.body.countInStock,
        rating: request.body.rating,
        isFeatured: request.body.isFeatured,
        productRam: request.body.productRam,
        size: request.body.size,
        productWeight: request.body.productWeight,
        isVerified: request.body.isVerified,
        vendorId: request.body.vendorId,
        barcode: request.body.barcode,
        variation: request.body.variation,
      },
      { new: true }
    );

    if (!product) {
      return response.status(404).json({
        message: "the product can not be updated!",
        status: false,
      });
    }

    imagesArr = [];

    return response.status(200).json({
      message: "The product is updated",
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

export async function createProductRAMS(request, response) {
  try {
    let productRAMS = new ProductRAMSModel({
      name: request.body.name,
    });

    productRAMS = await productRAMS.save();

    if (!productRAMS) {
      response.status(500).json({
        error: true,
        success: false,
        message: "Product RAMS Not created",
      });
    }

    return response.status(200).json({
      message: "Product RAMS Created successfully",
      error: false,
      success: true,
      product: productRAMS,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function deleteProductRAMS(request, response) {
  const productRams = await ProductRAMSModel.findById(request.params.id);

  if (!productRams) {
    return response.status(404).json({
      message: "Item Not found",
      error: true,
      success: false,
    });
  }

  const deletedProductRams = await ProductRAMSModel.findByIdAndDelete(
    request.params.id
  );

  if (!deletedProductRams) {
    response.status(404).json({
      message: "Item not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    success: true,
    error: false,
    message: "Product Ram Deleted!",
  });
}

export async function updateProductRam(request, response) {
  try {
    const productRam = await ProductRAMSModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    );

    if (!productRam) {
      return response.status(404).json({
        message: "the product Ram can not be updated!",
        status: false,
      });
    }

    return response.status(200).json({
      message: "The product Ram is updated",
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

export async function getProductRams(request, response) {
  try {
    const productRam = await ProductRAMSModel.find();

    if (!productRam) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: productRam,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getProductRamsById(request, response) {
  try {
    const productRam = await ProductRAMSModel.findById(request.params.id);

    if (!productRam) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: productRam,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function createProductWEIGHT(request, response) {
  try {
    let productWeight = new ProductWEIGHTModel({
      name: request.body.name,
    });

    productWeight = await productWeight.save();

    if (!productWeight) {
      response.status(500).json({
        error: true,
        success: false,
        message: "Product WEIGHT Not created",
      });
    }

    return response.status(200).json({
      message: "Product WEIGHT Created successfully",
      error: false,
      success: true,
      product: productWeight,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function deleteProductWEIGHT(request, response) {
  const productWeight = await ProductWEIGHTModel.findById(request.params.id);

  if (!productWeight) {
    return response.status(404).json({
      message: "Item Not found",
      error: true,
      success: false,
    });
  }

  const deletedProductWeight = await ProductWEIGHTModel.findByIdAndDelete(
    request.params.id
  );

  if (!deletedProductWeight) {
    response.status(404).json({
      message: "Item not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    success: true,
    error: false,
    message: "Product Weight Deleted!",
  });
}

export async function updateProductWeight(request, response) {
  try {
    const productWeight = await ProductWEIGHTModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    );

    if (!productWeight) {
      return response.status(404).json({
        message: "the product weight can not be updated!",
        status: false,
      });
    }

    return response.status(200).json({
      message: "The product weight is updated",
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

export async function getProductWeight(request, response) {
  try {
    const productWeight = await ProductWEIGHTModel.find();

    if (!productWeight) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: productWeight,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getProductWeightById(request, response) {
  try {
    const productWeight = await ProductWEIGHTModel.findById(request.params.id);

    if (!productWeight) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: productWeight,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function createProductSize(request, response) {
  try {
    let productSize = new ProductSIZEModel({
      name: request.body.name,
    });

    productSize = await productSize.save();

    if (!productSize) {
      response.status(500).json({
        error: true,
        success: false,
        message: "Product size Not created",
      });
    }

    return response.status(200).json({
      message: "Product size Created successfully",
      error: false,
      success: true,
      product: productSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function deleteProductSize(request, response) {
  const productSize = await ProductSIZEModel.findById(request.params.id);

  if (!productSize) {
    return response.status(404).json({
      message: "Item Not found",
      error: true,
      success: false,
    });
  }

  const deletedProductSize = await ProductSIZEModel.findByIdAndDelete(
    request.params.id
  );

  if (!deletedProductSize) {
    response.status(404).json({
      message: "Item not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    success: true,
    error: false,
    message: "Product size Deleted!",
  });
}

export async function updateProductSize(request, response) {
  try {
    const productSize = await ProductSIZEModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    );

    if (!productSize) {
      return response.status(404).json({
        message: "the product size can not be updated!",
        status: false,
      });
    }

    return response.status(200).json({
      message: "The product size is updated",
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

export async function getProductSize(request, response) {
  try {
    const productSize = await ProductSIZEModel.find();

    if (!productSize) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: productSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getProductSizeById(request, response) {
  try {
    const productSize = await ProductSIZEModel.findById(request.params.id);

    if (!productSize) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: productSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// export async function filters(request, response) {
//   const {
//     catId,
//     subCatId,
//     thirdsubCatId,
//     minPrice,
//     maxPrice,
//     rating,
//     page,
//     limit,
//   } = request.body;

//   const filters = {};

//   if (catId?.length) {
//     filters.catId = { $in: catId };
//   }

//   if (subCatId?.length) {
//     filters.subCatId = { $in: subCatId };
//   }

//   if (thirdsubCatId?.length) {
//     filters.thirdsubCatId = { $in: thirdsubCatId };
//   }

//   if (minPrice || maxPrice) {
//     filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
//   }

//   if (rating?.length) {
//     filters.rating = { $in: rating };
//   }

//   try {
//     const products = await ProductModel.find(filters)
//       .populate("category")
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     const total = await ProductModel.countDocuments(filters);

//     return response.status(200).json({
//       error: false,
//       success: true,
//       products: products,
//       total: total,
//       page: parseInt(page),
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

export async function filters(request, response) {
  const {
    catId,
    subCatId,
    thirdsubCatId,
    minPrice,
    maxPrice,
    rating,
    page,
    limit,
  } = request.body;

  const filters = {};

  // Add isVerified condition
  filters.isVerified = true;

  if (catId?.length) {
    filters.catId = { $in: catId };
  }

  if (subCatId?.length) {
    filters.subCatId = { $in: subCatId };
  }

  if (thirdsubCatId?.length) {
    filters.thirdsubCatId = { $in: thirdsubCatId };
  }

  if (minPrice || maxPrice) {
    filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
  }

  if (rating?.length) {
    filters.rating = { $in: rating };
  }

  try {
    const products = await ProductModel.find(filters)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ProductModel.countDocuments(filters);

    if (!products || products.length === 0) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "No verified products found with the applied filters",
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Sort function
const sortItems = (products, sortBy, order) => {
  return products.sort((a, b) => {
    if (sortBy === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortBy === "price") {
      return order === "asc" ? a.price - b.price : b.price - a.price;
    }
    return 0; // Default
  });
};

export async function sortBy(request, response) {
  const { products, sortBy, order } = request.body;
  const sortedItems = sortItems([...products?.products], sortBy, order);
  return response.status(200).json({
    error: false,
    success: true,
    products: sortedItems,
    totalPages: 0,
    page: 0,
  });
}

export async function searchProductController(request, response) {
  try {
    const { query, page: queryPage, limit: queryLimit } = request.body;
    const page = parseInt(queryPage) || 1;
    const limit = parseInt(queryLimit) || 10;

    if (!query) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Query parameter 'query' is required",
      });
    }

    const searchFilter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { catName: { $regex: query, $options: "i" } },
        { subCat: { $regex: query, $options: "i" } },
        { thirdsubCat: { $regex: query, $options: "i" } },
      ],
      isVerified: true,
    };

    const products = await ProductModel.find(searchFilter)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ProductModel.countDocuments(searchFilter);

    const totalPages = Math.ceil(total / limit);

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      total: total,
      page: page,
      totalPages: totalPages,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function searchByImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Image file required" });
  }

  try {
    // 1️⃣ upload + get AI tags
    const { tags: aiTags = [] } = await uploadAndTag(req.file.buffer);

    if (aiTags.length === 0) {
      return res
        .status(200)
        .json({ queryTags: [], products: [], message: "No tags detected" });
    }

    // 2️⃣ aggregate by tag intersection
    const products = await ProductModel.aggregate([
      {
        $addFields: {
          matchCount: {
            $size: { $setIntersection: [aiTags, "$tags"] },
          },
        },
      },
      { $match: { matchCount: { $gt: 0 } } },
      { $sort: { matchCount: -1, createdAt: -1 } },
      { $limit: 20 },
    ]);

    res.json({ queryTags: aiTags, products });
  } catch (err) {
    console.error("searchByImage error:", err);
    res.status(500).json({ message: err.message });
  }
}
