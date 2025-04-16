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
} from "../controllers/vendor.controller.js";
import multer from "multer";
import vendorAuth from "../middlewares/vendorAuth.js";

const vendorRouter = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

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
vendorRouter.get('/logout',vendorAuth,logoutVendor);
vendorRouter.get('/vendor-details',vendorAuth,vendorDetails);

export default vendorRouter;
