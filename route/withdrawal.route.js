import { Router } from "express";
import vendorAuth from "../middlewares/vendorAuth.js";
import auth from "../middlewares/auth.js";
import {
  createWithdrawalController,
  getAllWithdrawals,
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

withdrawalRouter.get("/admin-withdrawals", auth, getAllWithdrawals);

export default withdrawalRouter;
