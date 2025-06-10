import jwt from "jsonwebtoken";
import DeliveryBoyModel from "../models/deliveryBoy.model.js";

const deliveryAuth = async (req, res, next) => {
  try {
    // 1. Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized: No token provided" });
    }

    // 2. Extract and verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY);

    // 3. Fetch the delivery boy from DB
    const deliveryBoy = await DeliveryBoyModel.findById(decoded.id).select(
      "_id name"
    );
    if (!deliveryBoy) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized: Invalid token" });
    }

    // 4. Attach to req.user
    req.user = {
      id: deliveryBoy._id.toString(),
      role: "deliveryBoy",
      name: deliveryBoy.name,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({
      error: true,
      message: "Unauthorized: Token verification failed",
    });
  }
};

export default deliveryAuth;
