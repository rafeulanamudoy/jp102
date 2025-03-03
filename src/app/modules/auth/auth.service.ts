import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";

import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { ILogin, IProfileUpdate } from "./auth.interface";
import { ObjectId } from "mongodb";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import generateOTP from "../../../helpers/generateOtp";
import sendEmail from "../../../utilities/senderEmail";
import { UserStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";

//login user
const loginUserIntoDB = async (payload: ILogin) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    user?.password
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = jwtHelpers.generateToken(
    user,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  const { password, status, ...userInfo } = user;

  return {
    accessToken,
    userInfo,
  };
};

const getProfileFromDB = async (userId: string) => {
  if (!ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(404, "user not found!");
  }

  const { password,  ...sanitizedUser } = user;

  return sanitizedUser;
};

const updateProfileIntoDB = async (
  userId: string,
  userData: IProfileUpdate
) => {
  if (!ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "user not found for edit user");
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data:{...userData},
  });

  const { password, ...sanitizedUser } = updatedUser;

  return sanitizedUser;
};

const verifyOtp = async (payload: any) => {
  const { email, otp } = payload;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const existingOtp = await prisma.otpModel.findUnique({ where: { email } });
  if (!existingOtp || existingOtp.code !== otp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Wrong OTP");
  }

  if (existingOtp.otpExpiry && new Date() > existingOtp.otpExpiry) {
    await prisma.otpModel.delete({ where: { email } });
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Your OTP has expired. Please request a new one."
    );
  }

  await Promise.all([
    prisma.user.update({
      where: { email },
      data: { status: UserStatus.ACTIVE },
    }),
    prisma.otpModel.delete({ where: { email } }),
  ]);

  return jwtHelpers.generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );
};

const sendOtpToGmail = async (email: string) => {
  const existringUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!existringUser) {
    throw new ApiError(404, "User not found");
  }
  // Generate OTP and expiry time
  const otp = generateOTP(); // 4-digit OTP
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
  const subject = "Your Password Reset OTP";
  const html = `<!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
   </head>
   <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
         <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #FF7600, #45a049); padding: 30px 20px; text-align: center;">
               <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
         </div>
          <div style="padding: 20px 12px; text-align: center;">
              <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
               <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for verifying your account is:</p>
              <p style="font-size: 36px; font-weight: bold; color: #FF7600; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">${otp}</p>
             <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
               <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                  <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
              </div>
          </div>
         <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
           <p style="margin: 0;">© 2023 Your Company Name. All rights reserved.</p>
           </div>
       </div>
   </body>
  </html>`;
  await sendEmail(email, subject, html);
  await prisma.otpModel.upsert({
    where: {
      email: email,
    },
    update: { code: otp, otpExpiry: new Date(expiresAt) },
    create: { email: email, code: otp, otpExpiry: new Date(expiresAt) },
  });

  return otp;
};

const sendOtpToPhone=async (email: string) => {
  const existringUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!existringUser) {
    throw new ApiError(404, "User not found");
  }
  // Generate OTP and expiry time
  const otp = generateOTP(); // 4-digit OTP
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
 
  await prisma.otpModel.upsert({
    where: {
      email: email,
    },
    update: { code: otp, otpExpiry: new Date(expiresAt) },
    create: { email: email, code: otp, otpExpiry: new Date(expiresAt) },
  });

  return otp;
};

const verifyForgotPasswordOtp = async (payload: any) => {
  const { email, otp } = payload;

  if (!email && !otp) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userId = user.id;

  const verifyData = await prisma.otpModel.findUnique({
    where: {
      email: email,
    },
  });

  if (!verifyData) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  const { code: savedOtp, otpExpiry } = verifyData;

  if (otp !== savedOtp) {
    throw new ApiError(401, "Invalid OTP.");
  }

  if (!otpExpiry || Date.now() > otpExpiry.getTime()) {
    await prisma.otpModel.delete({
      where: {
        email: email,
      },
    }); // OTP has expired
    throw new ApiError(410, "OTP has expired. Please request a new OTP.");
  }

  // OTP is valid
  await prisma.otpModel.delete({
    where: {
      email: email,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    { id: userId, email },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return { accessToken: accessToken };
};
const resetForgotPassword = async (newPassword: string, userId: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new ApiError(404, "user not found");
  }
  const email = existingUser.email as string;
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.jwt.gen_salt)
  );

  const result = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      password: hashedPassword,
    },
  });
  const { password, ...userInfo } = result;
  return userInfo;
};
export const authService = {
  loginUserIntoDB,
  getProfileFromDB,
  updateProfileIntoDB,
  verifyOtp,
  resetForgotPassword,
  sendOtpToGmail,
  verifyForgotPasswordOtp,
  sendOtpToPhone
};
