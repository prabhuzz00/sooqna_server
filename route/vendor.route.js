import express from "express";

import {
  createVendor,
  deleteVendor,
  editVendor,
  getVendors,
  loginVendor,
  logoutVendor,
  updateVendorStatus,
  vendorDetails,
  verifyVendor,
  uploadImages,
  uploadBannerImages,
} from "../controllers/vendor.controller.js";
import upload from "../middlewares/multer.js";
import vendorAuth from "../middlewares/vendorAuth.js";

const vendorRouter = express.Router();

// Route to create a vendor
vendorRouter.post(
  "/",
  upload.fields([{ name: "storeLogo" }, { name: "storeBanner" }]),
  createVendor
);
vendorRouter.get("/list", getVendors);
vendorRouter.patch("/verify/:id", verifyVendor);
vendorRouter.patch(
  "/:id",
  upload.fields([{ name: "storeLogo" }, { name: "storeBanner" }]),
  editVendor
);
vendorRouter.delete("/:id", deleteVendor);
vendorRouter.patch("/status/:id", updateVendorStatus);
vendorRouter.post("/login", loginVendor);
vendorRouter.get("/logout", vendorAuth, logoutVendor);
vendorRouter.get("/vendor-details", vendorAuth, vendorDetails);
vendorRouter.post(
  "/uploadImages",
  // vendorAuth,
  upload.array("images"),
  uploadImages
);
vendorRouter.post(
  "/uploadBannerImages",
  // vendorAuth,
  upload.array("bannerImages"),
  uploadBannerImages
);

export default vendorRouter;
