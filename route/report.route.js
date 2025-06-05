import { Router } from "express";
import auth from "../middlewares/auth.js";
import { getReportController } from "../controllers/report.controller.js";

const reportRouter = Router();

/* GET  /api/report/summary  (protected) */
reportRouter.get("/summary", auth, getReportController);

export default reportRouter;
