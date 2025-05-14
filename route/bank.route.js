import { Router } from "express";
import vendorAuth from "../middlewares/vendorAuth.js";
import {
  addBankController,
  deleteBankController,
  editBank,
  getBankController,
  getSingleBankController,
} from "../controllers/bank.controller.js";

const bankRouter = Router();
bankRouter.post("/add", vendorAuth, addBankController);
bankRouter.get("/get", vendorAuth, getBankController);
bankRouter.get("/:id", vendorAuth, getSingleBankController);
bankRouter.delete("/:id", vendorAuth, deleteBankController);
bankRouter.put("/:id", vendorAuth, editBank);

export default bankRouter;
