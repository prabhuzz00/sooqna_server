import express from "express";
import {
  createServiceZone,
  deleteServiceZone,
  getServiceZones,
  updateServiceZone,
} from "../controllers/serviceZone.controller.js";

const serviceZoneRouter = express.Router();

serviceZoneRouter.get("/", getServiceZones);
serviceZoneRouter.post("/", createServiceZone);
serviceZoneRouter.put("/:id", updateServiceZone);
serviceZoneRouter.delete("/:id", deleteServiceZone);

export default serviceZoneRouter;
