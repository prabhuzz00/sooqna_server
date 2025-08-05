// import ServiceZone from "../models/ServiceZone.js";

// // Get all service zones
// export const getServiceZones = async (req, res) => {
//   try {
//     const isAdmin = req.query.admin === "true";
//     const zones = await ServiceZone.find().lean();

//     if (isAdmin) {
//       // Return full data for admin, including doorStepService
//       return res.status(200).json({ success: true, data: zones });
//     }
//     const formatted = zones.reduce((result, zone) => {
//       result[zone.city] = {
//         areas: zone.areas.map((a) => (typeof a === "string" ? a : a.name)),
//         doorStepService: zone.doorStepService,
//       };
//       return result;
//     }, {});

//     res.status(200).json({ success: true, data: formatted });
//   } catch (e) {
//     res.status(500).json({ success: false, message: e.message });
//   }
// };

// // Add a new service zone
// export const createServiceZone = async (req, res) => {
//   try {
//     const { city, areas, doorStepService = false } = req.body;
//     const newZone = new ServiceZone({ city, areas, doorStepService });
//     await newZone.save();
//     res.status(201).json(newZone);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Update an existing service zone
// export const updateServiceZone = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { city, areas, doorStepService = false } = req.body;

//     const updatedZone = await ServiceZone.findByIdAndUpdate(
//       id,
//       { city, areas, doorStepService },
//       { new: true }
//     );

//     if (!updatedZone) {
//       return res.status(404).json({ message: "Service zone not found" });
//     }

//     res.json(updatedZone);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Delete a service zone
// export const deleteServiceZone = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedZone = await ServiceZone.findByIdAndDelete(id);
//     if (!deletedZone) {
//       return res.status(404).json({ message: "Service zone not found" });
//     }
//     res.json({ message: "Service zone deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import ServiceZone from "../models/ServiceZone.js";

// Get all service zones
export const getServiceZones = async (req, res) => {
  try {
    const isAdmin = req.query.admin === "true";
    const zones = await ServiceZone.find().lean();

    if (isAdmin) {
      // Admin gets full area detail with doorstep flags
      return res.status(200).json({ success: true, data: zones });
    }

    // Non-admin: flatten areas to names only
    const formatted = zones.reduce((result, zone) => {
      result[zone.city] = {
        areas: zone.areas.map((a) => a.name),
      };
      return result;
    }, {});

    res.status(200).json({ success: true, data: formatted });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Add a new service zone
export const createServiceZone = async (req, res) => {
  try {
    const { city, areas } = req.body;
    const newZone = new ServiceZone({ city, areas });
    await newZone.save();
    res.status(201).json(newZone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an existing service zone
export const updateServiceZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { city, areas } = req.body;

    const updatedZone = await ServiceZone.findByIdAndUpdate(
      id,
      { city, areas },
      { new: true }
    );

    if (!updatedZone) {
      return res.status(404).json({ message: "Service zone not found" });
    }

    res.json(updatedZone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a service zone
export const deleteServiceZone = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedZone = await ServiceZone.findByIdAndDelete(id);
    if (!deletedZone) {
      return res.status(404).json({ message: "Service zone not found" });
    }
    res.json({ message: "Service zone deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
