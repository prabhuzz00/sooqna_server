import ShippingModel from "../models/shipping.model.js";

export const getShippingSetting = async (req, res) => {
  try {
    const shippingSetting = await ShippingModel.findOne();
    res.status(200).json({ success: true, data: shippingSetting });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipping settings",
    });
  }
};

export const updateShippingSetting = async (req, res) => {
  try {
    const { deliveryFee, FreeDeliveryFee } = req.body;

    const data = {
      deliveryFee,
      FreeDeliveryFee,
    };

    let shippingSetting = await ShippingModel.findOne();

    if (shippingSetting) {
      Object.assign(shippingSetting, data);
    } else {
      shippingSetting = new ShippingModel(data);
    }

    await shippingSetting.save();

    res.status(200).json({ success: true, data: shippingSetting });
  } catch (error) {
    console.error("Error updating shipping setting:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
