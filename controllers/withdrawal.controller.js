import Vendor from "../models/vendor.model.js";
import withdrawalModel from "../models/withdrawal.model.js";

export const createWithdrawalController = async (request, response) => {
  try {
    const { vendorId, withdrawal_amt, bank_details } = request.body;

    // 1. Fetch vendor details
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return response.status(404).json({
        error: true,
        message: "Vendor not found",
        success: false,
      });
    }

    // 2. Check available balance
    if (withdrawal_amt > vendor.availableBalance) {
      return response.status(400).json({
        error: true,
        message: "Insufficient balance for withdrawal",
        success: false,
      });
    }

    // 3. Create withdrawal request
    const withdrawal = new withdrawalModel({
      vendorId,
      withdrawal_amt,
      bank_details,
    });

    await withdrawal.save();

    // 4. Deduct balance from vendor
    vendor.availableBalance -= withdrawal_amt;
    await vendor.save();

    return response.status(200).json({
      error: false,
      success: true,
      message: "Withdrawal requested successfully",
      withdrawal,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getWithdrawalsByVendor = async (req, res) => {
  try {
    const vendorId = req.vendorId; // Assuming vendor ID is set by middleware after verifying token

    const withdrawals = await withdrawalModel
      .find({ vendorId })
      .populate("bank_details") // Optional: if you want full bank info
      .sort({ createdAt: -1 }); // Optional: latest first

    return res.status(200).json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateWithdrawalStatusController = async (request, response) => {
  try {
    const { id, withdrawal_status } = request.body;

    if (!id || !withdrawal_status) {
      return response.status(400).json({
        message: "Withdrawal ID and status are required",
        success: false,
        error: true,
      });
    }

    const withdrawal = await withdrawalModel.findById(id);
    if (!withdrawal) {
      return response.status(404).json({
        message: "Withdrawal not found",
        success: false,
        error: true,
      });
    }

    // If already approved, don't allow changes
    if (withdrawal.withdrawal_status === "Approved") {
      return response.status(400).json({
        message: "Approved withdrawal status cannot be changed",
        success: false,
        error: true,
      });
    }

    // If status is "Rejected", refund vendor
    if (withdrawal_status === "Rejected") {
      const vendor = await Vendor.findById(withdrawal.vendorId);
      if (!vendor) {
        return response.status(404).json({
          message: "Vendor not found",
          success: false,
          error: true,
        });
      }

      vendor.availableBalance += withdrawal.withdrawal_amt;
      await vendor.save();
    }

    // Update withdrawal status
    const updatedWithdrawal = await withdrawalModel.findByIdAndUpdate(
      id,
      { withdrawal_status },
      { new: true }
    );

    return response.status(200).json({
      message: `Withdrawal ${withdrawal_status.toLowerCase()} successfully`,
      success: true,
      error: false,
      data: updatedWithdrawal,
    });
  } catch (error) {
    console.error("Error updating withdrawal status:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};
