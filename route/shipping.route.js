import express from "express";
import {
    getShippingSetting,
    updateShippingSetting
} from "../controllers/shipping.controller.js";

const router = express.Router();

router.get("/", getShippingSetting);
router.put("/", updateShippingSetting);

export default router;
