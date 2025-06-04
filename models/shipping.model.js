import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema({
    deliveryFee: {
        type: Number,
        default: 0,
    },
    FreeDeliveryFee : {
        type: Number,
        default: 0,
    }
})

const ShippingModel = mongoose.model('shipping', shippingSchema);
export default ShippingModel;