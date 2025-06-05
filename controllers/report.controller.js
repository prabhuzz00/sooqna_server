import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import VendorModel from "../models/vendor.model.js";

/**
 * GET  /api/report/summary
 * Everything the dashboard needs in one call:
 *   • sales ⟶ daily / monthly / yearly buckets
 *   • user  ⟶ daily / monthly / yearly buckets
 *
 * Sales buckets expose:
 *   totalOrders, totalAmount,
 *   vendorSales, adminSales, commission,
 *   pendingOrders, deliveredOrders, returnedOrders
 */
export const getReportController = async (req, res) => {
  try {
    /* ------------------------------------------------- *
     * 1⃣  Cheap look-up table:  vendorId → commission %
     * ------------------------------------------------- */
    const vendors = await VendorModel.find(
      {},
      { _id: 1, commissionRate: 1 }
    ).lean();
    const vendorRate = {};
    vendors.forEach(
      (v) => (vendorRate[v._id.toString()] = v.commissionRate || 0)
    );

    /* ------------------------------------------------- *
     * 2⃣  Pull raw data
     * ------------------------------------------------- */
    const orders = await OrderModel.find().lean();
    const users = await UserModel.find().lean();

    /* ------------------------------------------------- *
     * 3⃣  Bucket helpers
     * ------------------------------------------------- */
    const blankSalesBucket = () => ({
      totalOrders: 0,
      totalAmount: 0,
      vendorSales: 0,
      adminSales: 0,
      commission: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      returnedOrders: 0,
    });

    const salesDaily = Object.create(null);
    const salesMonthly = Object.create(null);
    const salesYearly = Object.create(null);

    const usersDaily = Object.create(null);
    const usersMonthly = Object.create(null);
    const usersYearly = Object.create(null);

    /* ------------------------------------------------- *
     * 4⃣  Walk every order once
     * ------------------------------------------------- */
    for (const order of orders) {
      const ts = new Date(order.createdAt);
      const dKey = ts.toISOString().slice(0, 10); // YYYY-MM-DD
      const mKey = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(
        2,
        "0"
      )}`; // YYYY-MM
      const yKey = `${ts.getFullYear()}`;

      [
        [salesDaily, dKey],
        [salesMonthly, mKey],
        [salesYearly, yKey],
      ].forEach(([obj, key]) => (obj[key] ||= blankSalesBucket()));

      let vendorVal = 0,
        adminVal = 0,
        commissionVal = 0;

      for (const line of order.products) {
        const lineTotal =
          line.subTotal ?? (line.price || 0) * (line.quantity ?? 1);

        if (line.vendorId) {
          vendorVal += lineTotal;
          commissionVal += (lineTotal * (vendorRate[line.vendorId] || 0)) / 100;
        } else {
          adminVal += lineTotal;
        }
      }

      const orderTotal = order.totalAmt ?? vendorVal + adminVal;

      for (const [obj, key] of [
        [salesDaily, dKey],
        [salesMonthly, mKey],
        [salesYearly, yKey],
      ]) {
        const bucket = obj[key];
        bucket.totalOrders += 1;
        bucket.totalAmount += orderTotal;
        bucket.vendorSales += vendorVal;
        bucket.adminSales += adminVal;
        bucket.commission += commissionVal;

        switch (order.order_status) {
          case "Pending":
            bucket.pendingOrders += 1;
            break;
          case "Delivered":
            bucket.deliveredOrders += 1;
            break;
          case "Returned":
            bucket.returnedOrders += 1;
            break;
          default:
            break;
        }
      }
    }

    /* ------------------------------------------------- *
     * 5⃣  Walk every user once
     * ------------------------------------------------- */
    for (const user of users) {
      const ts = new Date(user.createdAt);
      const dKey = ts.toISOString().slice(0, 10);
      const mKey = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const yKey = `${ts.getFullYear()}`;

      usersDaily[dKey] = (usersDaily[dKey] || 0) + 1;
      usersMonthly[mKey] = (usersMonthly[mKey] || 0) + 1;
      usersYearly[yKey] = (usersYearly[yKey] || 0) + 1;
    }

    /* ------------------------------------------------- *
     * 6⃣  Helpers to sort & reshape
     * ------------------------------------------------- */
    const mapToArray = (obj, label, users = false) =>
      Object.entries(obj)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) =>
          users ? { [label]: k, totalUsers: v } : { [label]: k, ...v }
        );

    /* ------------------------------------------------- *
     * 7⃣  Done ✅
     * ------------------------------------------------- */
    return res.status(200).json({
      success: true,
      error: false,
      data: {
        sales: {
          daily: mapToArray(salesDaily, "date"),
          monthly: mapToArray(salesMonthly, "month"),
          yearly: mapToArray(salesYearly, "year"),
        },
        users: {
          daily: mapToArray(usersDaily, "date", true),
          monthly: mapToArray(usersMonthly, "month", true),
          yearly: mapToArray(usersYearly, "year", true),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || err,
    });
  }
};
