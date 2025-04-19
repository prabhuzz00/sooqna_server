import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createBrand,
  deleteBrand,
  getBrands,
  getBrandsCount,
  getBrand,
  removeImageFromCloudinary,
  updatedBrand,
  uploadImages,
} from "../controllers/brand.controller.js";

const brandRouter = Router();

brandRouter.post("/uploadImages", auth, upload.array("images"), uploadImages);
brandRouter.post("/create", auth, createBrand);
brandRouter.get("/", getBrands);
brandRouter.get("/get/count", getBrandsCount);
brandRouter.get("/:id", getBrand);
brandRouter.delete("/deteleImage", auth, removeImageFromCloudinary);
brandRouter.delete("/:id", auth, deleteBrand);
brandRouter.put("/:id", auth, updatedBrand);

export default brandRouter;
