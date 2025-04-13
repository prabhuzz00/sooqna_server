import express from "express";
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";
import {
  createVendor,
  deleteVendor,
  editVendor,
  getVendors,
  updateVendorStatus,
  verifyVendor,
  uploadImages,
  uploadBannerImages,
  loginVendor,
} from "../controllers/vendor.controller.js";
import multer from "multer";

const vendorRouter = express.Router();

// Configure multer for file uploads
// const upload = multer({
//   dest: "uploads/",
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only images are allowed"));
//     }
//   },
// });

vendorRouter.post("/uploadImages", auth, upload.array("images"), uploadImages);
vendorRouter.post(
  "/uploadBannerImages",
  auth,
  upload.array("bannerimages"),
  uploadBannerImages
);

// Route to create a vendor
vendorRouter.post(
  "/",
  // upload.fields([{ name: "storeLogo" }, { name: "storeBanner" }]),
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

export default vendorRouter;
