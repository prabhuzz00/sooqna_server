import jwt from "jsonwebtoken";
import DeliveryBoyModel from "../models/deliveryBoy.model.js";
import OrderModel from "../models/order.model.js";
import bcrypt from "bcryptjs";

/* jwt helper (same secret as other modules) */
const sign = (id) =>
  jwt.sign({ id, role: "deliveryBoy" }, process.env.JSON_WEB_TOKEN_SECRET_KEY, {
    expiresIn: "30d",
  });

/* ──────────────────────────────────────────
   1️⃣  ADMIN → create delivery-boy account
   POST  /api/deliveryboy
────────────────────────────────────────── */
export const createDeliveryBoy = async (req, res) => {
  try {
    const { name, email, phone, password, gender, address } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: true, message: "All required" });

    const dup = await DeliveryBoyModel.findOne({ $or: [{ email }, { phone }] });
    if (dup)
      return res
        .status(409)
        .json({ error: true, message: "Email or phone already exists" });

    const boy = await DeliveryBoyModel.create({
      name,
      email,
      phone,
      password,
      gender,
      address,
    });

    res.status(201).json({ success: true, data: boy });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message || e });
  }
};

/* ──────────────────────────────────────────
   2️⃣  DELIVERY-BOY → login
   POST  /api/deliveryboy/login
────────────────────────────────────────── */
// export const loginDeliveryBoy = async (req, res) => {
//   try {
//     const { emailOrPhone, password } = req.body;
//     const boy = await DeliveryBoyModel.findOne({
//       $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
//     }).select("+password");

//     console.log("Login attempt:", emailOrPhone);
//     if (!boy || !(await boy.comparePassword(password)))
//       return res
//         .status(401)
//         .json({ error: true, message: "Invalid credentials" });

//     res.status(200).json({
//       success: true,
//       token: sign(boy._id),
//       data: { id: boy._id, name: boy.name, email: boy.email },
//     });
//   } catch (e) {
//     res.status(500).json({ error: true, message: e.message || e });
//   }
// };
export const loginDeliveryBoy = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    console.log("Login attempt:", emailOrPhone);

    const boy = await DeliveryBoyModel.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    }).select("+password");

    if (!boy) {
      console.log("No delivery boy found");
      return res
        .status(400)
        .json({ error: true, message: "No account with this email or phone." });
    }

    const isMatch = await boy.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch)
      return res
        .status(401)
        .json({ error: true, message: "Incorrect password." });

    if (!boy.isActive)
      return res.status(403).json({
        error: true,
        message: "Account inactive. Please contact admin.",
      });

    const token = sign(boy._id);
    res.status(200).json({
      success: true,
      token,
      data: { id: boy._id, name: boy.name, email: boy.email, phone: boy.phone },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: true, message: e.message || e });
  }
};

/* ──────────────────────────────────────────
   3️⃣  ADMIN → assign pending orders
   PUT   /api/deliveryboy/assign
   body: { deliveryBoyId, orderIds: [] }
────────────────────────────────────────── */
/* ──────────────────────────────────────────
   3️⃣  ADMIN → assign pending orders
   PUT   /api/deliveryboy/assign
   body: { deliveryBoyId, orderIds: [] }
────────────────────────────────────────── */
export const assignPendingOrders = async (req, res) => {
  try {
    const { deliveryBoyId, orderIds = [] } = req.body;
    if (!deliveryBoyId || !orderIds.length)
      return res
        .status(400)
        .json({ error: true, message: "deliveryBoyId & orderIds required" });

    /* only orders still pending */
    const result = await OrderModel.updateMany(
      { _id: { $in: orderIds }, order_status: "Received" },
      { deliveryBoyId, order_status: "Picked" }
    );

    res.status(200).json({ success: true, modified: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message || e });
  }
};

/* ──────────────────────────────────────────
   4️⃣  DELIVERY-BOY → change order status
   PUT   /api/deliveryboy/order/:id/status
   body: { status: "Picked" | "Delivered" | "Returned" }
────────────────────────────────────────── */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // order id
    const { status } = req.body; // new status
    const allowed = ["Picked", "Delivered", "Returned"];

    if (!allowed.includes(status))
      return res.status(400).json({ error: true, message: "Invalid status" });

    /* ensure the order belongs to this delivery-boy */
    const order = await OrderModel.findOne({
      _id: id,
      deliveryBoyId: req.user.id,
    });
    if (!order)
      return res.status(404).json({
        error: true,
        message: "Order not found or not assigned to you",
      });

    order.deliveryStatus = status;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message || e });
  }
};

/* ──────────────────────────────────────────
   5️⃣  DELIVERY-BOY → stats / list
   GET   /api/deliveryboy/:id/orders?status=Delivered
────────────────────────────────────────── */
// export const getMyOrders = async (req, res) => {
//   try {
//     const { id } = req.params; // delivery-boy id
//     const { status } = req.query; // optional filter

//     /* admins can fetch anyone; delivery-boy only himself */
//     if (req.user.role === "deliveryBoy" && req.user.id !== id)
//       return res.status(403).json({ error: true, message: "Forbidden" });

//     const filter = { deliveryBoyId: id };
//     if (status) filter.deliveryStatus = status;

//     const orders = await OrderModel.find(filter);

//     res.status(200).json({ success: true, count: orders.length, data: orders });
//   } catch (e) {
//     res.status(500).json({ error: true, message: e.message || e });
//   }
// };
export const getMyOrders = async (req, res) => {
  try {
    const { id } = req.params; // deliveryBoyId in URL
    const { status } = req.query;

    const filter = { deliveryBoyId: id };
    if (status) filter.deliveryStatus = status;

    const orders = await OrderModel.find(filter);

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message || e });
  }
};

/* ──────────────────────────────────────────
   ADMIN → list all delivery boys
   GET /api/deliveryboy
────────────────────────────────────────── */
export const getAllDeliveryBoys = async (req, res) => {
  try {
    const boys = await DeliveryBoyModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: boys });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message || e });
  }
};

/* ──────────────────────────────────────────
   ADMIN → update (or toggle active)
   PUT /api/deliveryboy/:id
────────────────────────────────────────── */
export const updateDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, gender, address, isActive, password } =
      req.body;

    const boy = await DeliveryBoyModel.findById(id);
    if (!boy)
      return res.status(404).json({ error: true, message: "Not found" });

    /* prevent duplicate email / phone */
    if (email && email !== boy.email) {
      const dup = await DeliveryBoyModel.findOne({ email });
      if (dup)
        return res
          .status(409)
          .json({ error: true, message: "Email already in use" });
      boy.email = email;
    }
    if (phone && phone !== boy.phone) {
      const dup = await DeliveryBoyModel.findOne({ phone });
      if (dup)
        return res
          .status(409)
          .json({ error: true, message: "Phone already in use" });
      boy.phone = phone;
    }

    if (name) boy.name = name;
    if (gender) boy.gender = gender;
    if (address !== undefined) boy.address = address;
    if (isActive !== undefined) boy.isActive = isActive;
    if (password) boy.password = await bcrypt.hash(password, 12);

    await boy.save();

    res.status(200).json({ success: true, data: boy });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message || e });
  }
};

/* ──────────────────────────────────────────
   ADMIN → delete
   DELETE /api/deliveryboy/:id
────────────────────────────────────────── */
export const deleteDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    await DeliveryBoyModel.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message || e });
  }
};
