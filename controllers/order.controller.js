import OrderModel from "../models/order.model.js";
import Vendor from "../models/vendor.model.js";
import ProductModel from "../models/product.modal.js";
import UserModel from "../models/user.model.js";
import paypal from "@paypal/checkout-server-sdk";
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import pdfTable from "pdfkit-table";
import AddressModel from "../models/address.model.js";
import PickupConfirmationEmail from "../utils/orderEmailPickup.js";

export const createOrderController = async (request, response) => {
  try {
    let qrCodeImg = await QRCode.toDataURL(request.body.barcode);
    let order = new OrderModel({
      userId: request.body.userId,
      products: request.body.products,
      paymentId: request.body.paymentId,
      payment_status: request.body.payment_status,
      delivery_address: request.body.delivery_address,
      totalAmt: request.body.totalAmt,
      couponCode: request.body.couponCode,
      pickupPoint: request.body.pickupPoint,
      couponDiscount: request.body.couponDiscount,
      barcode: request.body.barcode,
      qrCode: qrCodeImg,
      date: request.body.date,
    });

    console.log("products: ", request.body.products);

    if (!order) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    order = await order.save();

    for (let i = 0; i < request.body.products.length; i++) {
      const productData = request.body.products[i];

      const product = await ProductModel.findOne({
        _id: productData.productId,
      });

      if (!product) continue;

      // Update main product countInStock and sale
      await ProductModel.findByIdAndUpdate(productData.productId, {
        countInStock: parseInt(product.countInStock - productData.quantity),
        sale: parseInt((product?.sale || 0) + productData.quantity),
      });

      // Update variation stock using MongoDB arrayFilters
      await ProductModel.updateOne(
        {
          _id: productData.productId,
          "variation.color.label": productData.selectedColor,
        },
        {
          $inc: {
            "variation.$[variant].sizes.$[size].countInStock":
              -productData.quantity,
          },
        },
        {
          arrayFilters: [
            { "variant.color.label": productData.selectedColor },
            { "size.label": productData.size },
          ],
        }
      );
    }

    const user = await UserModel.findOne({ _id: request.body.userId });

    const recipients = [];
    recipients.push(user?.email);

    // Send verification email
    await sendEmailFun({
      sendTo: recipients,
      subject: "Order Confirmation",
      text: "",
      html:
        request.body.pickupPoint === "DoorStep"
          ? OrderConfirmationEmail(user?.name, order)
          : PickupConfirmationEmail(
              user?.name,
              order,
              request.body.pickupPoint
            ),
    });

    return response.status(200).json({
      error: false,
      success: true,
      message: "Order Placed",
      order: order,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// create order return controller
export const createOrderReturnController = async (request, response) => {
  try {
    let qrCodeImg = await QRCode.toDataURL(request.body.barcode);
    let order = new OrderModel({
      userId: request.body.userId,
      products: request.body.products,
      paymentId: request.body.paymentId,
      payment_status: request.body.payment_status,
      delivery_address: request.body.delivery_address,
      totalAmt: request.body.totalAmt,
      couponCode: request.body.couponCode,
      couponDiscount: request.body.couponDiscount,
      barcode: request.body.barcode,
      qrCode: qrCodeImg,
      date: request.body.date,
      orderType: "Return",
    });

    console.log("products: ", request.body.products);

    if (!order) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    order = await order.save();

    for (let i = 0; i < request.body.products.length; i++) {
      const productData = request.body.products[i];

      const product = await ProductModel.findOne({
        _id: productData.productId,
      });

      if (!product) continue;

      // Update main product countInStock and sale
      await ProductModel.findByIdAndUpdate(productData.productId, {
        countInStock: parseInt(product.countInStock - productData.quantity),
        sale: parseInt((product?.sale || 0) + productData.quantity),
      });

      // Update variation stock using MongoDB arrayFilters
      await ProductModel.updateOne(
        {
          _id: productData.productId,
          "variation.color.label": productData.selectedColor,
        },
        {
          $inc: {
            "variation.$[variant].sizes.$[size].countInStock":
              -productData.quantity,
          },
        },
        {
          arrayFilters: [
            { "variant.color.label": productData.selectedColor },
            { "size.label": productData.size },
          ],
        }
      );
    }

    const user = await UserModel.findOne({ _id: request.body.userId });

    const recipients = [];
    recipients.push(user?.email);

    // Send verification email
    // await sendEmailFun({
    //   sendTo: recipients,
    //   subject: "Order Confirmation",
    //   text: "",
    //   html: OrderConfirmationEmail(user?.name, order),
    // });

    return response.status(200).json({
      error: false,
      success: true,
      message: "Order Placed",
      order: order,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get order detail
export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;
    const { page, limit } = request.query;

    const orderlist = await OrderModel.find()
      .sort({ createdAt: -1 })
      .populate("delivery_address userId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await OrderModel.countDocuments(orderlist);

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get pending order
export async function getPendingOrderController(request, response) {
  try {
    const userId = request.userId; // order id

    const { page, limit } = request.query;

    const orderlist = await OrderModel.find({ order_status: "Pending" })
      .sort({ createdAt: -1 })
      .populate("delivery_address userId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await OrderModel.countDocuments(orderlist);

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get recived order list

export async function getRecivedOrderController(request, response) {
  try {
    const userId = request.userId; // order id

    const { page, limit } = request.query;

    const orderlist = await OrderModel.find({ order_status: "Received" })
      .sort({ createdAt: -1 })
      .populate("delivery_address userId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await OrderModel.countDocuments(orderlist);

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get delivered orders
export const getDeliveredOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const query = { order_status: "Delivered" };

    const orders = await OrderModel.find(query)
      .populate("userId", "name email") // keep or drop as you need
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await OrderModel.countDocuments(query);

    res.json({
      error: false,
      data: orders,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("getDeliveredOrders:", e);
    res.status(500).json({ error: true, message: e.message || e });
  }
};

//get order return
export async function getOrderReturnController(request, response) {
  try {
    const userId = request.userId; // order id

    console.log("im her");

    const { page, limit } = request.query;

    const orderlist = await OrderModel.find({ orderType: "Return" })
      .sort({ createdAt: -1 })
      .populate("delivery_address userId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await OrderModel.countDocuments({ orderType: "Return" });

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Get vendor order details
export async function getVendorOrderDetailsController(request, response) {
  try {
    const vendorId = request.query.vendorId;
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;

    if (!vendorId) {
      return response.status(400).json({
        message: "Vendor ID is required",
        error: true,
        success: false,
      });
    }

    // Find orders that include at least one product from this vendor
    const rawOrders = await OrderModel.find({
      "products.vendorId": vendorId,
    })
      .sort({ createdAt: -1 })
      .populate("delivery_address userId")
      .skip((page - 1) * limit)
      .limit(limit);

    // Filter products within each order and exclude orders with no matching products
    const filteredOrders = rawOrders
      .map((order) => {
        const filteredProducts = order.products.filter(
          (product) =>
            product.vendorId && product.vendorId.toString() === vendorId
        );

        if (filteredProducts.length === 0) return null; // Skip orders with no matching products

        return {
          ...order.toObject(),
          products: filteredProducts,
        };
      })
      .filter((order) => order !== null); // Remove nulls (orders with no matching products)

    // Count total matching orders (note: some might get filtered if no valid products remain)
    const total = await OrderModel.countDocuments({
      "products.vendorId": vendorId,
    });

    return response.json({
      message: "Order list retrieved successfully",
      data: filteredOrders,
      error: false,
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function getUserOrderDetailsController(request, response) {
  try {
    const userId = request.userId; // order id

    const { page, limit, orderType } = request.query;

    console.log("orderType: ", orderType);

    const orderlist = await OrderModel.find({
      userId: userId,
      orderType: orderType,
    })
      .sort({ createdAt: -1 })
      .populate("delivery_address userId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const orderTotal = await OrderModel.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address userId");

    const total = await orderTotal?.length;

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getTotalOrdersCountController(request, response) {
  try {
    const ordersCount = await OrderModel.countDocuments();
    return response.status(200).json({
      error: false,
      success: true,
      count: ordersCount,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

function getPayPalClient() {
  const environment =
    process.env.PAYPAL_MODE === "live"
      ? new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID_LIVE,
          process.env.PAYPAL_SECRET_LIVE
        )
      : new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID_TEST,
          process.env.PAYPAL_SECRET_TEST
        );

  return new paypal.core.PayPalHttpClient(environment);
}

export const createOrderPaypalController = async (request, response) => {
  try {
    const req = new paypal.orders.OrdersCreateRequest();
    req.prefer("return=representation");

    req.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: request.query.totalAmount,
          },
        },
      ],
    });

    try {
      const client = getPayPalClient();
      const order = await client.execute(req);
      response.json({ id: order.result.id });
    } catch (error) {
      console.error(error);
      response.status(500).send("Error creating PayPal order");
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const captureOrderPaypalController = async (request, response) => {
  try {
    const { paymentId } = request.body;

    const req = new paypal.orders.OrdersCaptureRequest(paymentId);
    req.requestBody({});

    const orderInfo = {
      userId: request.body.userId,
      products: request.body.products,
      paymentId: request.body.paymentId,
      payment_status: request.body.payment_status,
      delivery_address: request.body.delivery_address,
      totalAmt: request.body.totalAmount,
      date: request.body.date,
    };

    const order = new OrderModel(orderInfo);
    await order.save();

    const user = await UserModel.findOne({ _id: request.body.userId });

    const recipients = [];
    recipients.push(user?.email);

    // Send verification email
    await sendEmailFun({
      sendTo: recipients,
      subject: "Order Confirmation",
      text: "",
      html: OrderConfirmationEmail(user?.name, order),
    });

    for (let i = 0; i < request.body.products.length; i++) {
      const product = await ProductModel.findOne({
        _id: request.body.products[i].productId,
      });

      await ProductModel.findByIdAndUpdate(
        request.body.products[i].productId,
        {
          countInStock: parseInt(
            request.body.products[i].countInStock -
              request.body.products[i].quantity
          ),
          sale: parseInt(product?.sale + request.body.products[i].quantity),
        },
        { new: true }
      );
    }

    return response.status(200).json({
      success: true,
      error: false,
      order: order,
      message: "Order Placed",
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const updateOrderStatusController = async (request, response) => {
  try {
    const { id, order_status } = request.body;
    console.log("Order status received:", order_status);

    const order = await OrderModel.findById(id);
    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        success: false,
        error: true,
      });
    }

    // --- Step 1: If order_status is "Received", update dueBalance ---
    if (order_status === "Received") {
      for (const product of order.products) {
        if (product.vendorId) {
          const vendor = await Vendor.findById(product.vendorId);
          if (vendor) {
            const vendorEarning =
              product.subTotal * ((100 - vendor.commissionRate) / 100);

            vendor.dueBalance += vendorEarning;
            await vendor.save();
          }
        }
      }
    }

    // --- Step 2: If order_status is "Delivered", transfer dueBalance to availableBalance ---
    if (order_status === "Delivered") {
      for (const product of order.products) {
        if (product.vendorId) {
          const vendor = await Vendor.findById(product.vendorId);
          if (vendor) {
            const vendorEarning =
              product.subTotal * ((100 - vendor.commissionRate) / 100);

            vendor.availableBalance += vendorEarning;
            vendor.dueBalance -= vendorEarning;
            await vendor.save();
          }
        }
      }
    }

    // --- Step 3: If order_status is "Canceled", remove dueBalance ---
    if (order_status === "Canceled") {
      for (const product of order.products) {
        if (product.vendorId) {
          const vendor = await Vendor.findById(product.vendorId);
          if (vendor) {
            const vendorEarning =
              product.subTotal * ((100 - vendor.commissionRate) / 100);

            vendor.dueBalance -= vendorEarning;
            if (vendor.dueBalance < 0) vendor.dueBalance = 0; // Optional safeguard
            await vendor.save();
          }
        }
      }
    }

    // Update the order status and status history
    const updateOrder = await OrderModel.findByIdAndUpdate(
      id,
      {
        order_status,
        $push: {
          statusHistory: {
            status: order_status,
            updatedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return response.json({
      message: "Order status updated successfully",
      success: true,
      error: false,
      data: updateOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const totalSalesController = async (request, response) => {
  try {
    const currentYear = new Date().getFullYear();

    const ordersList = await OrderModel.find();

    let totalSales = 0;
    let monthlySales = [
      {
        name: "JAN",
        TotalSales: 0,
      },
      {
        name: "FEB",
        TotalSales: 0,
      },
      {
        name: "MAR",
        TotalSales: 0,
      },
      {
        name: "APRIL",
        TotalSales: 0,
      },
      {
        name: "MAY",
        TotalSales: 0,
      },
      {
        name: "JUNE",
        TotalSales: 0,
      },
      {
        name: "JULY",
        TotalSales: 0,
      },
      {
        name: "AUG",
        TotalSales: 0,
      },
      {
        name: "SEP",
        TotalSales: 0,
      },
      {
        name: "OCT",
        TotalSales: 0,
      },
      {
        name: "NOV",
        TotalSales: 0,
      },
      {
        name: "DEC",
        TotalSales: 0,
      },
    ];

    for (let i = 0; i < ordersList.length; i++) {
      totalSales = totalSales + parseInt(ordersList[i].totalAmt);
      const str = JSON.stringify(ordersList[i]?.createdAt);
      const year = str.substr(1, 4);
      const monthStr = str.substr(6, 8);
      const month = parseInt(monthStr.substr(0, 2));

      if (currentYear == year) {
        if (month === 1) {
          monthlySales[0] = {
            name: "JAN",
            TotalSales: (monthlySales[0].TotalSales =
              parseInt(monthlySales[0].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 2) {
          monthlySales[1] = {
            name: "FEB",
            TotalSales: (monthlySales[1].TotalSales =
              parseInt(monthlySales[1].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 3) {
          monthlySales[2] = {
            name: "MAR",
            TotalSales: (monthlySales[2].TotalSales =
              parseInt(monthlySales[2].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 4) {
          monthlySales[3] = {
            name: "APRIL",
            TotalSales: (monthlySales[3].TotalSales =
              parseInt(monthlySales[3].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 5) {
          monthlySales[4] = {
            name: "MAY",
            TotalSales: (monthlySales[4].TotalSales =
              parseInt(monthlySales[4].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 6) {
          monthlySales[5] = {
            name: "JUNE",
            TotalSales: (monthlySales[5].TotalSales =
              parseInt(monthlySales[5].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 7) {
          monthlySales[6] = {
            name: "JULY",
            TotalSales: (monthlySales[6].TotalSales =
              parseInt(monthlySales[6].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 8) {
          monthlySales[7] = {
            name: "AUG",
            TotalSales: (monthlySales[7].TotalSales =
              parseInt(monthlySales[7].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 9) {
          monthlySales[8] = {
            name: "SEP",
            TotalSales: (monthlySales[8].TotalSales =
              parseInt(monthlySales[8].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 10) {
          monthlySales[9] = {
            name: "OCT",
            TotalSales: (monthlySales[9].TotalSales =
              parseInt(monthlySales[9].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 11) {
          monthlySales[10] = {
            name: "NOV",
            TotalSales: (monthlySales[10].TotalSales =
              parseInt(monthlySales[10].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }

        if (month === 12) {
          monthlySales[11] = {
            name: "DEC",
            TotalSales: (monthlySales[11].TotalSales =
              parseInt(monthlySales[11].TotalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
      }
    }

    return response.status(200).json({
      totalSales: totalSales,
      monthlySales: monthlySales,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get Total Order Count for Vendor
export async function getTotalOrdersCountVendorController(request, response) {
  try {
    const vendorId = request.query.vendorId;

    if (!vendorId) {
      return response.status(400).json({
        message: "Vendor ID is required",
        error: true,
        success: false,
      });
    }

    const ordersCount = await OrderModel.countDocuments({
      "products.vendorId": vendorId,
    });

    return response.status(200).json({
      error: false,
      success: true,
      count: ordersCount,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get total sale of vendor

export const totalSalesVendorController = async (request, response) => {
  try {
    const vendorId = request.query.vendorId;

    if (!vendorId) {
      return response.status(400).json({
        message: "Vendor ID is required",
        error: true,
        success: false,
      });
    }

    const currentYear = new Date().getFullYear();

    // Fetch the vendor to get commission rate
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return response.status(404).json({
        message: "Vendor not found",
        error: true,
        success: false,
      });
    }

    const commissionRate = vendor.commissionRate || 0; // e.g., 20 means 20%

    const ordersList = await OrderModel.find({
      "products.vendorId": vendorId,
    });

    let totalSales = 0;
    const monthlySales = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i)
        .toLocaleString("default", { month: "short" })
        .toUpperCase(),
      TotalSales: 0,
      TotalOrders: 0,
    }));

    for (const order of ordersList) {
      const orderDate = new Date(order.createdAt);
      const year = orderDate.getFullYear();
      const month = orderDate.getMonth(); // 0-indexed

      const vendorProducts = order.products.filter(
        (p) => p.vendorId && p.vendorId.toString() === vendorId
      );

      const vendorTotal = vendorProducts.reduce(
        (sum, p) => sum + (p.subTotal || 0),
        0
      );

      const adjustedTotal = vendorTotal - (vendorTotal * commissionRate) / 100;

      totalSales += adjustedTotal;

      if (year === currentYear) {
        monthlySales[month].TotalSales += adjustedTotal;
        monthlySales[month].TotalOrders += 1;
      }
    }

    return response.status(200).json({
      totalSales,
      monthlySales,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const totalUsersController = async (request, response) => {
  try {
    const users = await UserModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    let monthlyUsers = [
      {
        name: "JAN",
        TotalUsers: 0,
      },
      {
        name: "FEB",
        TotalUsers: 0,
      },
      {
        name: "MAR",
        TotalUsers: 0,
      },
      {
        name: "APRIL",
        TotalUsers: 0,
      },
      {
        name: "MAY",
        TotalUsers: 0,
      },
      {
        name: "JUNE",
        TotalUsers: 0,
      },
      {
        name: "JULY",
        TotalUsers: 0,
      },
      {
        name: "AUG",
        TotalUsers: 0,
      },
      {
        name: "SEP",
        TotalUsers: 0,
      },
      {
        name: "OCT",
        TotalUsers: 0,
      },
      {
        name: "NOV",
        TotalUsers: 0,
      },
      {
        name: "DEC",
        TotalUsers: 0,
      },
    ];

    for (let i = 0; i < users.length; i++) {
      if (users[i]?._id?.month === 1) {
        monthlyUsers[0] = {
          name: "JAN",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 2) {
        monthlyUsers[1] = {
          name: "FEB",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 3) {
        monthlyUsers[2] = {
          name: "MAR",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 4) {
        monthlyUsers[3] = {
          name: "APRIL",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 5) {
        monthlyUsers[4] = {
          name: "MAY",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 6) {
        monthlyUsers[5] = {
          name: "JUNE",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 7) {
        monthlyUsers[6] = {
          name: "JULY",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 8) {
        monthlyUsers[7] = {
          name: "AUG",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 9) {
        monthlyUsers[8] = {
          name: "SEP",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 10) {
        monthlyUsers[9] = {
          name: "OCT",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 11) {
        monthlyUsers[10] = {
          name: "NOV",
          TotalUsers: users[i].count,
        };
      }

      if (users[i]?._id?.month === 12) {
        monthlyUsers[11] = {
          name: "DEC",
          TotalUsers: users[i].count,
        };
      }
    }

    return response.status(200).json({
      TotalUsers: monthlyUsers,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export async function deleteOrder(request, response) {
  const order = await OrderModel.findById(request.params.id);

  console.log(request.params.id);

  if (!order) {
    return response.status(404).json({
      message: "Order Not found",
      error: true,
      success: false,
    });
  }

  const deletedOrder = await OrderModel.findByIdAndDelete(request.params.id);

  if (!deletedOrder) {
    response.status(404).json({
      message: "Order not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    success: true,
    error: false,
    message: "Order Deleted!",
  });
}

export const downloadInvoiceController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await OrderModel.findById(orderId)
      .populate("userId")
      .populate("delivery_address");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const doc = new PDFDocument({ margin: 50 });

    // === Register Font ===
    const fontPath = path.resolve("fonts/NotoSansArabic-Regular.ttf");
    if (!fs.existsSync(fontPath)) throw new Error("Font file not found");
    doc.registerFont("Universal", fontPath);
    doc.font("Universal");

    // === Setup Response ===
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${orderId}.pdf`
    );
    doc.pipe(res);

    // === Logo and Invoice Title ===
    const logoPath = path.resolve("public/sooqna.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 60 });
    }
    doc
      .fontSize(20)
      .fillColor("#28a745")
      .text("Invoice", 450, 40, { align: "right" });
    doc.moveDown(2);

    // === Billed By Box ===
    doc
      .save()
      .roundedRect(50, 90, 230, 100, 5)
      .fillOpacity(0.1)
      .fillAndStroke("#DFF5EC", "#DFF5EC")
      .restore();

    doc
      .fillOpacity(1)
      .fillColor("#000")
      .font("Universal")
      .fontSize(10)
      .text("Billed by:", 60, 100)
      .text(
        "Foobar Labs\n46, Raghuveer Dham Society\nBengaluru, Karnataka, India – 560054\nGSTIN: 29ABCDE1234F2Z5\nPAN: ABECD1234F",
        { width: 210 }
      );

    // === Billed To Box ===
    doc
      .save()
      .roundedRect(300, 90, 230, 100, 5)
      .fillOpacity(0.1)
      .fillAndStroke("#DFF5EC", "#DFF5EC")
      .restore();

    const addr = order.delivery_address;
    doc
      .fillOpacity(1)
      .fillColor("#000")
      .font("Universal")
      .fontSize(10)
      .text("Billed to:", 310, 100)
      .text(
        `${order.userId?.name}\n${addr?.address_line1}, ${addr?.city}\n${addr?.state}, ${addr?.country}\nIndia - ${addr?.pincode}\nPhone: ${addr?.mobile}`,
        { width: 210 }
      );

    // === Metadata ===
    doc.moveTo(50, 200).moveDown().fontSize(10);
    doc.text(`Place of Supply: Karnataka`);
    doc.text(`Country of Supply: India`);
    doc.moveDown();

    // === Product Table Header ===
    let y = doc.y + 10;
    doc
      .font("Universal")
      .fontSize(10)
      .fillColor("#000")
      .text("Item", 50, y)
      // .text("HSN", 170, y)
      .text("Qty", 220, y)
      .text("GST", 260, y)
      .text("Taxable", 310, y)
      .text("SGST", 380, y)
      .text("CGST", 440, y)
      .text("Amount", 500, y);

    doc
      .moveTo(50, y + 15)
      .lineTo(560, y + 15)
      .stroke();
    y += 25;

    // === Product Rows ===
    order.products.forEach((p) => {
      const gstPercent = 9;
      const taxable = p.subTotal || p.price * p.quantity;
      const gstSplit = (taxable * gstPercent) / 100;
      const total = taxable + 2 * gstSplit;

      doc
        .fillColor("#000")
        .text(p.name || "N/A", 50, y)
        // .text("06", 170, y)
        .text(p.quantity.toString(), 220, y)
        .text(`${gstPercent}%`, 260, y)
        .text(`₹${taxable.toFixed(2)}`, 310, y)
        .text(`₹${gstSplit.toFixed(2)}`, 380, y)
        .text(`₹${gstSplit.toFixed(2)}`, 440, y)
        .text(`₹${total.toFixed(2)}`, 500, y);
      y += 20;
    });

    // === Totals ===
    y += 20;
    const gstTotal = order.totalAmt * 0.09;
    doc
      .font("Universal")
      .fontSize(10)
      .fillColor("#000")
      .text(
        `Sub Total: ₹${(order.totalAmt - 2 * gstTotal).toFixed(2)}`,
        450,
        y
      );
    y += 15;
    doc.text(`CGST: ₹${gstTotal.toFixed(2)}`, 450, y);
    y += 15;
    doc.text(`SGST: ₹${gstTotal.toFixed(2)}`, 450, y);
    y += 15;
    doc.fontSize(11).text(`Total: ₹${order.totalAmt.toFixed(2)}`, 450, y);

    // === Bank & Payment Details ===
    y += 40;
    doc
      .font("Universal")
      .fontSize(10)
      .fillColor("#000")
      .text("Bank & Payment Details", 50, y);
    doc.text(
      `Account Name: Foobar Labs\nAccount Number: 45506287967\nIFSC: SBIN001519\nBank: State Bank of India\nUPI: foobarlabs@okSBI`,
      { width: 250 }
    );

    // === QR Code (Optional) ===
    if (
      order.qrCode &&
      typeof order.qrCode === "string" &&
      order.qrCode.startsWith("data:image")
    ) {
      const base64 = order.qrCode.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(base64, "base64");
      doc.image(qrBuffer, 450, doc.y - 80, { width: 80 });
    }

    // === Terms and Notes ===
    y = doc.y + 20;
    doc.fontSize(9).text("Terms and Conditions", 50, y);
    doc.text(
      "1. Please pay within 15 days from the date of invoice. Overdue invoices are subject to a 14% late fee."
    );
    doc.text("2. Please quote invoice number when remitting funds.");

    doc.moveDown();
    doc.text("Additional Notes", 50, doc.y);
    doc.text(
      "It is a long established fact that a reader will be distracted by the readable content..."
    );

    // === Footer ===
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("Thank you for your business!", 0, doc.y + 30, {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("Invoice generation error:", err);
    res.status(500).json({ message: "Error generating invoice" });
  }
};

export const downloadShippingLabelController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await OrderModel.findById(orderId)
      .populate("userId")
      .populate("delivery_address");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Path to Noto Sans Arabic font
    const fontPath = path.resolve("fonts/NotoSansArabic-Regular.ttf");

    // Register font
    doc.registerFont("Universal", fontPath);
    doc.font("Universal"); // Use it globally if needed

    // Setup response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=shipping-label-${orderId}.pdf`
    );
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Shipping Label", { align: "center" });
    doc.moveDown();

    // Basic Info
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Customer: ${order.userId?.name}`);
    doc.text(`Phone: ${order.delivery_address?.mobile}`);
    doc.moveDown();

    // Shipping Address
    doc.text("Shipping Address:", { underline: true });

    // Use font that supports Arabic here (in case address includes Arabic)
    doc
      .font("Universal")
      .text(
        `${order.delivery_address?.address_line1}, ${order.delivery_address?.city}, ${order.delivery_address?.state}, ${order.delivery_address?.country} - ${order.delivery_address?.pincode}`
      );

    doc.moveDown();
    doc.font("Universal").text(`Total Amount: $${order.totalAmt}`);

    // Optional QR Code
    if (order.qrCode && order.qrCode.startsWith("data:image")) {
      const base64 = order.qrCode.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(base64, "base64");
      doc.image(qrBuffer, { fit: [100, 100], align: "center" });
    }

    doc.end();
  } catch (err) {
    console.error("Shipping label generation error:", err);
    res.status(500).json({ message: "Error generating shipping label" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow delivery boy to view their assigned order
    const order = await OrderModel.findOne({
      _id: id,
      deliveryBoyId: req.user.id, // Only assigned to this delivery boy
    }).select("barcode"); // Only return barcode field

    if (!order) {
      return res.status(404).json({
        error: true,
        message: "Order not found or not assigned to you",
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: true, message: e.message || e });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Order ID is required",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findById(id)
      .populate({
        path: "userId",
        select: "name email phone avatar",
      })
      .populate({
        path: "delivery_address",
        select: "address_line1 city area landmark mobile addressType",
      })
      .populate({
        path: "deliveryBoyId",
        select: "name phone email",
      })
      .populate({
        path: "deliveredBy.id",
        select: "name phone email",
      });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      message: "Order details retrieved successfully",
      error: false,
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
};
