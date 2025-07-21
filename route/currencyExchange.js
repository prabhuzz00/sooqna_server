// const express = require("express");
import express from "express";
const router = express.Router();
import {
  getCurrencyRates,
  updateCurrencyRates,
  getCurrencyRateByKey,
  deleteCurrencyRate,
  addCurrencyRate,
} from "../controllers/currencyExchangeController.js";

// Optional: Add authentication middleware if needed
// const { authenticate, authorize } = require('../middleware/auth');

// GET /api/currency-rates - Get all currency rates
router.get("/", getCurrencyRates);

// PUT /api/currency-rates - Update currency rates (bulk update)
router.put("/", updateCurrencyRates);

// GET /api/currency-rates/:currencyKey - Get single currency rate by key
router.get("/:currencyKey", getCurrencyRateByKey);

// POST /api/currency-rates - Add new currency rate
router.post("/", addCurrencyRate);

// DELETE /api/currency-rates/:currencyKey - Delete currency rate (soft delete)
router.delete("/:currencyKey", deleteCurrencyRate);

export default router;
