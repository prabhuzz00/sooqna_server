import ProductModel from "../models/product.modal.js";
import Vendor from "../models/vendor.model.js";

export async function unifiedSearch(req, res) {
  try {
    const { query, page = 1, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Query parameter 'query' is required",
      });
    }

    // Search products
    const productSearchFilter = {
      name: { $regex: query, $options: "i" },
      isVerified: true,
    };

    const products = await ProductModel.find(productSearchFilter)
      .select("_id name images")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalProducts = await ProductModel.countDocuments(
      productSearchFilter
    );

    // Search vendors
    const vendorSearchFilter = {
      storeName: { $regex: query, $options: "i" },
      isVerified: true,
    };

    const vendors = await Vendor.find(vendorSearchFilter)
      .select("_id storeName storeLogo")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalVendors = await Vendor.countDocuments(vendorSearchFilter);

    return res.status(200).json({
      error: false,
      success: true,
      products: products.map((p) => ({
        _id: p._id,
        name: p.name,
        image: p.images?.[0] || "",
      })),
      vendors: vendors.map((v) => ({
        _id: v._id,
        name: v.storeName,
        image: v.storeLogo?.[0] || "",
      })),
      total: {
        products: totalProducts,
        vendors: totalVendors,
      },
      page: parseInt(page),
      totalPages: {
        products: Math.ceil(totalProducts / limit),
        vendors: Math.ceil(totalVendors / limit),
      },
    });
  } catch (error) {
    console.error("Unified search error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
}
