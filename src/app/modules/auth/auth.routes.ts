import express from "express";
import { authController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import auth from "../../middlewares/auth";
import { multerUpload } from "../../../helpers/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = express.Router();

//login user
router.post(
  "/login",
  validateRequest(authValidation.authLoginSchema),
  authController.loginUser
);

router.get("/profile", auth(), authController.getProfile);

router.patch(
  "/profile",
  multerUpload.single("profileImage"),
  parseBodyData,
  validateRequest(authValidation.updateProfileSchema),
  auth(),
  authController.updateProfile
);
router.post("/otp-verify",authController.verifyOtp)
router.post("/send-otp-to-gmail", authController.sendOtpToGmail);
router.patch("/reset-password", auth(), authController.resetPassword);
export const authRoute = router;
