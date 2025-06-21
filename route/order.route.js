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
  downloadShippingLabelController,
  getRecivedOrderController,
  getOrderById,
  createOrderReturnController,
  getDeliveredOrders,
} from "../controllers/order.controller.js";
import deliveryAuth from "../middlewares/deliveryAuth.js";

const orderRouter = Router();

orderRouter.post("/create", auth, createOrderController);
orderRouter.post("/create-return", auth, createOrderReturnController);
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
orderRouter.get("/recived-order-list", auth, getRecivedOrderController);
orderRouter.get("/delivered", getDeliveredOrders);
orderRouter.get("/return-order-list", auth, getOrderReturnController);
orderRouter.get("/invoice/:orderId", auth, downloadInvoiceController);
orderRouter.get(
  "/shipping-label/:orderId",
  auth,
  downloadShippingLabelController
);

orderRouter.get("/:id", deliveryAuth, getOrderById);

export default orderRouter;
