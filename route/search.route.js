import { Router } from "express";
import { unifiedSearch } from "../controllers/search.controller.js";

const searchRouter = Router();

searchRouter.post("/unified", unifiedSearch);

export default searchRouter;
