import BankModel from "../models/bank.model.js";
import Vendor from "../models/vendor.model.js";

export const addBankController = async (request, response) => {
  try {
    const { fullName, accountNo, IFSC, Branch, bankname, vendorId } =
      request.body;

    const bank = new BankModel({
      fullName,
      accountNo,
      IFSC,
      Branch,
      bankname,
      vendorId,
    });

    const savedBank = await bank.save();

    const updateCartUser = await Vendor.updateOne(
      { _id: vendorId },
      {
        $push: {
          bank_details: savedBank?._id,
        },
      }
    );

    return response.status(200).json({
      data: savedBank,
      message: "Bank added successfully",
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

export const getBankController = async (request, response) => {
  try {
    const bank = await BankModel.find({ vendorId: request?.query?.vendorId });

    if (!bank) {
      return response.status({
        error: true,
        success: false,
        message: "bank not found",
      });
    } else {
      const updateVendor = await Vendor.updateOne(
        { _id: request?.query?.vendorId },
        {
          $push: {
            bank: bank?._id,
          },
        }
      );

      return response.status(200).json({
        error: false,
        success: true,
        data: bank,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteBankController = async (request, response) => {
  try {
    const vendorId = request.vendorId; // middleware
    const _id = request.params.id;

    if (!_id) {
      return response.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const deleteItem = await BankModel.deleteOne({
      _id: _id,
      vendorId: vendorId,
    });

    if (!deleteItem) {
      return response.status(404).json({
        message: "The bank in the database is not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "bank remove",
      error: false,
      success: true,
      data: deleteItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getSingleBankController = async (request, response) => {
  try {
    const id = request.params.id;

    const bank = await BankModel.findOne({ _id: id });

    if (!bank) {
      return response.status(404).json({
        message: "Bank not found ",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      bank: bank,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export async function editBank(request, response) {
  try {
    const id = request.params.id;

    const { fullName, accountNo, IFSC, Branch, bankname, vendorId } =
      request.body;

    const bank = await BankModel.findByIdAndUpdate(
      id,
      {
        fullName: fullName,
        accountNo: accountNo,
        IFSC: IFSC,
        Branch: Branch,
        bankname: bankname,
        vendorId: vendorId,
      },
      { new: true }
    );

    return response.json({
      message: "Bank Updated successfully",
      error: false,
      success: true,
      bank: bank,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
