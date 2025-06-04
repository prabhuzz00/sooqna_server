import express from "express";
import {
  getSiteSetting,
  updateSiteSetting,
} from "../controllers/siteSettings.controller.js";

const router = express.Router();

router.get("/", getSiteSetting);
router.put("/", updateSiteSetting);

export default router;
