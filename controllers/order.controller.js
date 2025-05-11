import OrderModel from "../models/order.model.js";
import VendorModel from "../models/vendor.model.js";
import ProductModel from "../models/product.modal.js";
import UserModel from "../models/user.model.js";
import paypal from "@paypal/checkout-server-sdk";
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
import QRCode from "qrcode";

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
      barcode: request.body.barcode,
      qrCode: qrCodeImg,
      date: request.body.date,
    });

    if (!order) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    order = await order.save();

    for (let i = 0; i < request.body.products.length; i++) {
      const product = await ProductModel.findOne({
        _id: request.body.products[i].productId,
      });
      console.log(product);

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
    const userId = request.userId; // order id

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

    const orderlist = await OrderModel.find({ order_status: "pending" })
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

//get order return
export async function getOrderReturnController(request, response) {
  try {
    const userId = request.userId; // order id

    const { page, limit } = request.query;

    const orderlist = await OrderModel.find({ order_status: "canceled" })
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

    const { page, limit } = request.query;

    const orderlist = await OrderModel.find({ userId: userId })
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
    console.log("order status received:", order_status);

    const order = await OrderModel.findById(id);
    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        success: false,
        error: true,
      });
    }

    const vendorMap = new Map(); // vendorId -> totalPrice

    order.products.forEach((product) => {
      const { vendorId, price } = product;
      if (!vendorId || !price) return;

      if (!vendorMap.has(vendorId)) {
        vendorMap.set(vendorId, 0);
      }

      vendorMap.set(vendorId, vendorMap.get(vendorId) + price);
    });

    for (const [vendorId, totalPrice] of vendorMap.entries()) {
      const vendor = await VendorModel.findById(vendorId);
      if (!vendor) {
        console.warn(`Vendor with ID ${vendorId} not found`);
        continue;
      }

      const commissionRate = vendor.commissionRate || 0;
      // console.log('commissionRate : ', commissionRate)
      const netAmount = totalPrice - (commissionRate / 100) * totalPrice;

      if (order_status === "confirm") {
        const newDueBalance = (vendor.dueBalance || 0) + netAmount;

        await VendorModel.findByIdAndUpdate(vendorId, {
          dueBalance: newDueBalance,
        });

        console.log(
          `Vendor ${vendorId} CONFIRMED: Added ${netAmount} to dueBalance`
        );
      }

      if (order_status === "delivered") {
        const newDueBalance = Math.max((vendor.dueBalance || 0) - netAmount, 0);
        const newAvailableBalance = (vendor.availableBalance || 0) + netAmount;

        await VendorModel.findByIdAndUpdate(vendorId, {
          dueBalance: newDueBalance,
          availableBalance: newAvailableBalance,
        });

        console.log(
          `Vendor ${vendorId} DELIVERED: Moved ${netAmount} from due to available balance`
        );
      }
    }

    // Now update the Order in one shot: (order_status + push statusHistory)
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
    const vendor = await VendorModel.findById(vendorId);
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
