import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  createDeliveryBoy,
  loginDeliveryBoy,
  assignPendingOrders,
  updateOrderStatus,
  getMyOrders,
  deleteDeliveryBoy,
  updateDeliveryBoy,
  getAllDeliveryBoys,
} from "../controllers/deliveryBoy.controller.js";

const deliveryBoyRouter = Router();

/* ---------- auth ---------- */
deliveryBoyRouter.post("/login", loginDeliveryBoy);

/* ---------- admin only ---------- */
deliveryBoyRouter.post("/", auth, createDeliveryBoy);
deliveryBoyRouter.put("/assign", auth, assignPendingOrders);
deliveryBoyRouter.get("/", auth, getAllDeliveryBoys); // list
deliveryBoyRouter.put("/:id", auth, updateDeliveryBoy); // edit / toggle
deliveryBoyRouter.delete("/:id", auth, deleteDeliveryBoy); // delete

/* ---------- delivery-boy ---------- */
deliveryBoyRouter.put("/order/:id/status", auth, updateOrderStatus);
deliveryBoyRouter.get("/:id/orders", getMyOrders);

export default deliveryBoyRouter;
