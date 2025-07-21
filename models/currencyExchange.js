import mongoose from "mongoose";

const currencyRateSchema = new mongoose.Schema(
  {
    currencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    currencyName: {
      type: String,
      required: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// currencyRateSchema.index({ currencyKey: 1 });
// currencyRateSchema.index({ isActive: 1 });

// Update lastUpdated before saving
currencyRateSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Instance method to format currency display
currencyRateSchema.methods.getDisplayInfo = function () {
  return {
    id: this._id,
    currencyKey: this.currencyKey,
    currencyName: this.currencyName,
    rate: this.rate,
    isActive: this.isActive,
    lastUpdated: this.lastUpdated,
  };
};

// Static method to get all active currencies
currencyRateSchema.statics.getActiveCurrencies = function () {
  return this.find({ isActive: true }).sort({ currencyName: 1 });
};

// Static method to update or create currency rate
currencyRateSchema.statics.updateOrCreateRate = async function (
  currencyKey,
  currencyName,
  rate
) {
  return await this.findOneAndUpdate(
    { currencyKey },
    {
      currencyName,
      rate,
      lastUpdated: new Date(),
      isActive: true,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

const CurrencyRate = mongoose.model("CurrencyRate", currencyRateSchema);

export default CurrencyRate;