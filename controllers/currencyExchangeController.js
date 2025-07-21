import CurrencyRate from "../models/currencyExchange.js";

// Get all currency rates
// export const getCurrencyRates = async (req, res) => {
//   try {
//     const currencyRates = await CurrencyRate.getActiveCurrencies();

//     res.status(200).json({
//       success: true,
//       message: "Currency rates fetched successfully",
//       data: currencyRates.map((rate) => rate.getDisplayInfo()),
//       count: currencyRates.length,
//     });
//   } catch (error) {
//     console.error("Error fetching currency rates:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch currency rates",
//       error: error.message,
//     });
//   }
// };

// // Update currency rates (bulk update)
// export const updateCurrencyRates = async (req, res) => {
//   try {
//     const { currencies } = req.body;

//     if (!currencies || !Array.isArray(currencies)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid data format. Expected array of currencies.",
//       });
//     }

//     // Validate each currency object
//     for (const currency of currencies) {
//       if (
//         !currency.currencyKey ||
//         !currency.currencyName ||
//         currency.rate === undefined
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Each currency must have currencyKey, currencyName, and rate.",
//         });
//       }

//       if (isNaN(currency.rate) || currency.rate < 0) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid rate for ${currency.currencyName}. Rate must be a positive number.`,
//         });
//       }
//     }

//     // Update or create each currency rate
//     const updatedRates = [];
//     for (const currency of currencies) {
//       try {
//         const updatedRate = await CurrencyRate.updateOrCreateRate(
//           currency.currencyKey,
//           currency.currencyName,
//           parseFloat(currency.rate)
//         );
//         updatedRates.push(updatedRate.getDisplayInfo());
//       } catch (updateError) {
//         console.error(`Error updating ${currency.currencyKey}:`, updateError);
//         // Continue with other currencies but log the error
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Currency rates updated successfully",
//       data: updatedRates,
//       count: updatedRates.length,
//     });
//   } catch (error) {
//     console.error("Error updating currency rates:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update currency rates",
//       error: error.message,
//     });
//   }
// };

// // Get single currency rate by key
// export const getCurrencyRateByKey = async (req, res) => {
//   try {
//     const { currencyKey } = req.params;

//     const currencyRate = await CurrencyRate.findOne({
//       currencyKey,
//       isActive: true,
//     });

//     if (!currencyRate) {
//       return res.status(404).json({
//         success: false,
//         message: "Currency rate not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Currency rate fetched successfully",
//       data: currencyRate.getDisplayInfo(),
//     });
//   } catch (error) {
//     console.error("Error fetching currency rate:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch currency rate",
//       error: error.message,
//     });
//   }
// };

// // Delete currency rate (soft delete by setting isActive to false)
// export const deleteCurrencyRate = async (req, res) => {
//   try {
//     const { currencyKey } = req.params;

//     const currencyRate = await CurrencyRate.findOneAndUpdate(
//       { currencyKey },
//       { isActive: false },
//       { new: true }
//     );

//     if (!currencyRate) {
//       return res.status(404).json({
//         success: false,
//         message: "Currency rate not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Currency rate deleted successfully",
//       data: currencyRate.getDisplayInfo(),
//     });
//   } catch (error) {
//     console.error("Error deleting currency rate:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete currency rate",
//       error: error.message,
//     });
//   }
// };

// // Add new currency rate
// export const addCurrencyRate = async (req, res) => {
//   try {
//     const { currencyKey, currencyName, rate } = req.body;

//     // Validation
//     if (!currencyKey || !currencyName || rate === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "currencyKey, currencyName, and rate are required",
//       });
//     }

//     if (isNaN(rate) || rate < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Rate must be a positive number",
//       });
//     }

//     // Check if currency already exists
//     const existingCurrency = await CurrencyRate.findOne({ currencyKey });
//     if (existingCurrency) {
//       return res.status(409).json({
//         success: false,
//         message: "Currency with this key already exists",
//       });
//     }

//     // Create new currency rate
//     const newCurrencyRate = new CurrencyRate({
//       currencyKey: currencyKey.toLowerCase(),
//       currencyName,
//       rate: parseFloat(rate),
//     });

//     await newCurrencyRate.save();

//     res.status(201).json({
//       success: true,
//       message: "Currency rate added successfully",
//       data: newCurrencyRate.getDisplayInfo(),
//     });
//   } catch (error) {
//     console.error("Error adding currency rate:", error);

//     // Handle mongoose validation errors
//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: Object.values(error.errors).map((err) => err.message),
//       });
//     }

//     // Handle duplicate key error
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Currency with this key already exists",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to add currency rate",
//       error: error.message,
//     });
//   }
// };


export const getCurrencyRates = async (req, res) => {
    try {
        const currencyRates = await CurrencyRate.getActiveCurrencies();
        
        // Check if this is a client request (for context) or admin request
        const isClientRequest = req.query.format === 'client' || req.headers['x-client-request'];
        
        if (isClientRequest) {
            // Format for client context - create rates object with currency codes as keys
            const ratesObject = {};
            const currencyCodeMap = {
                'saudi': 'SAR',
                'uae': 'AED', 
                'qatar': 'QAR',
                'bahrain': 'BHD',
                'kuwait': 'KWD',
                'euro': 'EUR',
                'dollar': 'USD',
                'syrian': 'SYP'
            };
            
            // Set USD as base currency with rate 1
            ratesObject['USD'] = 1;
            
            currencyRates.forEach(rate => {
                const currencyCode = currencyCodeMap[rate.currencyKey];
                if (currencyCode) {
                    ratesObject[currencyCode] = rate.rate;
                }
            });
            
            return res.status(200).json({
                success: true,
                message: "Currency rates fetched successfully",
                rates: ratesObject
            });
        }
        
        // Default admin format
        res.status(200).json({
            success: true,
            message: "Currency rates fetched successfully",
            data: currencyRates.map(rate => rate.getDisplayInfo()),
            count: currencyRates.length
        });
    } catch (error) {
        console.error('Error fetching currency rates:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch currency rates",
            error: error.message
        });
    }
};

// Update currency rates (bulk update)
export const updateCurrencyRates = async (req, res) => {
  try {
    const { currencies } = req.body;

    if (!currencies || !Array.isArray(currencies)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Expected array of currencies.",
      });
    }

    // Validate each currency object
    for (const currency of currencies) {
      if (
        !currency.currencyKey ||
        !currency.currencyName ||
        currency.rate === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each currency must have currencyKey, currencyName, and rate.",
        });
      }

      if (isNaN(currency.rate) || currency.rate < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid rate for ${currency.currencyName}. Rate must be a positive number.`,
        });
      }
    }

    // Update or create each currency rate
    const updatedRates = [];
    for (const currency of currencies) {
      try {
        const updatedRate = await CurrencyRate.updateOrCreateRate(
          currency.currencyKey,
          currency.currencyName,
          parseFloat(currency.rate)
        );
        updatedRates.push(updatedRate.getDisplayInfo());
      } catch (updateError) {
        console.error(`Error updating ${currency.currencyKey}:`, updateError);
        // Continue with other currencies but log the error
      }
    }

    res.status(200).json({
      success: true,
      message: "Currency rates updated successfully",
      data: updatedRates,
      count: updatedRates.length,
    });
  } catch (error) {
    console.error("Error updating currency rates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update currency rates",
      error: error.message,
    });
  }
};

// Get single currency rate by key
export const getCurrencyRateByKey = async (req, res) => {
    try {
        const { currencyKey } = req.params;

        const currencyRate = await CurrencyRate.findOne({ 
            currencyKey, 
            isActive: true 
        });

        if (!currencyRate) {
            return res.status(404).json({
                success: false,
                message: "Currency rate not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Currency rate fetched successfully",
            data: currencyRate.getDisplayInfo()
        });
    } catch (error) {
        console.error('Error fetching currency rate:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch currency rate",
            error: error.message
        });
    }
};

// Delete currency rate (soft delete by setting isActive to false)
export const deleteCurrencyRate = async (req, res) => {
    try {
        const { currencyKey } = req.params;

        const currencyRate = await CurrencyRate.findOneAndUpdate(
            { currencyKey },
            { isActive: false },
            { new: true }
        );

        if (!currencyRate) {
            return res.status(404).json({
                success: false,
                message: "Currency rate not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Currency rate deleted successfully",
            data: currencyRate.getDisplayInfo()
        });
    } catch (error) {
        console.error('Error deleting currency rate:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete currency rate",
            error: error.message
        });
    }
};

// Add new currency rate
export const addCurrencyRate = async (req, res) => {
    try {
        const { currencyKey, currencyName, rate } = req.body;

        // Validation
        if (!currencyKey || !currencyName || rate === undefined) {
            return res.status(400).json({
                success: false,
                message: "currencyKey, currencyName, and rate are required"
            });
        }

        if (isNaN(rate) || rate < 0) {
            return res.status(400).json({
                success: false,
                message: "Rate must be a positive number"
            });
        }

        // Check if currency already exists
        const existingCurrency = await CurrencyRate.findOne({ currencyKey });
        if (existingCurrency) {
            return res.status(409).json({
                success: false,
                message: "Currency with this key already exists"
            });
        }

        // Create new currency rate
        const newCurrencyRate = new CurrencyRate({
            currencyKey: currencyKey.toLowerCase(),
            currencyName,
            rate: parseFloat(rate)
        });

        await newCurrencyRate.save();

        res.status(201).json({
            success: true,
            message: "Currency rate added successfully",
            data: newCurrencyRate.getDisplayInfo()
        });
    } catch (error) {
        console.error('Error adding currency rate:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Currency with this key already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to add currency rate",
            error: error.message
        });
    }
};


