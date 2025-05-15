import { Router } from "express";
import auth from "../middlewares/auth.js";
import vendorAuth from "../middlewares/vendorAuth.js";
import {
  captureOrderPaypalController,
  createOrderController,
  getVendorOrderDetailsController,
  createOrderPaypalController,
  deleteOrder,
  getOrderDetailsController,
  getTotalOrdersCountController,
  getUserOrderDetailsController,
  totalSalesController,
  totalUsersController,
  updateOrderStatusController,
  getPendingOrderController,
  getOrderReturnController,
  getTotalOrdersCountVendorController,
  totalSalesVendorController,
  downloadInvoiceController,
} from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/create", auth, createOrderController);
orderRouter.get("/order-list", auth, getOrderDetailsController);
orderRouter.get(
  "/vendor-order-list",
  vendorAuth,
  getVendorOrderDetailsController
);
orderRouter.get("/create-order-paypal", auth, createOrderPaypalController);
orderRouter.post("/capture-order-paypal", auth, captureOrderPaypalController);
orderRouter.put("/order-status/:id", auth, updateOrderStatusController);
orderRouter.get("/count", auth, getTotalOrdersCountController);

orderRouter.get(
  "/count-vendor",
  vendorAuth,
  getTotalOrdersCountVendorController
);
orderRouter.get("/sales-vendor", vendorAuth, totalSalesVendorController);

orderRouter.get("/sales", auth, totalSalesController);
orderRouter.get("/users", auth, totalUsersController);
orderRouter.get("/order-list/orders", auth, getUserOrderDetailsController);
orderRouter.delete("/deleteOrder/:id", auth, deleteOrder);
orderRouter.get("/incomplete-order-list", auth, getPendingOrderController);
orderRouter.get("/return-order-list", auth, getOrderReturnController);
orderRouter.get("/invoice/:orderId", auth, downloadInvoiceController);

export default orderRouter;
