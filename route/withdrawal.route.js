import { Router } from "express";
import vendorAuth from "../middlewares/vendorAuth.js";
import auth from "../middlewares/auth.js";
import {
  createWithdrawalController,
  getWithdrawalsByVendor,
  updateWithdrawalStatusController,
} from "../controllers/withdrawal.controller.js";

const withdrawalRouter = Router();

withdrawalRouter.post("/create", vendorAuth, createWithdrawalController);
withdrawalRouter.get("/vendor-withdrawals", vendorAuth, getWithdrawalsByVendor);
withdrawalRouter.put(
  "/withdraw-status/:id",
  auth,
  updateWithdrawalStatusController
);

export default withdrawalRouter;
