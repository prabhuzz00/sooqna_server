import { Router } from "express";

import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  changePasswordController,
  deleteMultiple,
  deleteUser,
  getAllUsers,
  loginUserController,
  logoutController,
  refreshToken,
  registerUserController,
  removeImageFromCloudinary,
  updateUserDetails,
  userAvatarController,
  userDetails,
  verifyEmailController,
} from "../controllers/admin.controller.js";

const adminRouter = Router();
adminRouter.post("/register", registerUserController);
adminRouter.post("/verifyEmail", verifyEmailController);
adminRouter.post("/login", loginUserController);
adminRouter.get("/logout", auth, logoutController);
adminRouter.put(
  "/user-avatar",
  auth,
  upload.array("avatar"),
  userAvatarController
);
adminRouter.delete("/deteleImage", auth, removeImageFromCloudinary);
adminRouter.put("/:id", auth, updateUserDetails);
adminRouter.post("/forgot-password/change-password", changePasswordController);
adminRouter.post("/refresh-token", refreshToken);
adminRouter.get("/user-details", auth, userDetails);
adminRouter.get("/getAllUsers", getAllUsers);
adminRouter.delete("/deleteMultiple", deleteMultiple);
adminRouter.delete("/deleteUser/:id", deleteUser);

export default adminRouter;
