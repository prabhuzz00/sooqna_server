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
  completeDelivery,
} from "../controllers/deliveryBoy.controller.js";
import deliveryAuth from "../middlewares/deliveryAuth.js";

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
deliveryBoyRouter.put("/order/:id/status", deliveryAuth, updateOrderStatus);
deliveryBoyRouter.patch("/order/:id/complete", deliveryAuth, completeDelivery);
deliveryBoyRouter.get("/:id/orders", getMyOrders);

export default deliveryBoyRouter;
