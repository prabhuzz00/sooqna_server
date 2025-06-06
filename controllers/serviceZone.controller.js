import ServiceZone from "../models/ServiceZone.js";

// Get all cities and their areas
export const getServiceZones = async (req, res) => {
  try {
    const zones = await ServiceZone.find();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new city with areas
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

// Update a city's areas
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

// Delete a city
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
