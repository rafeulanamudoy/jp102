import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { stripeService } from "../stripe/stripe.service";

const createBooking = async (bookingData: any) => {
  const customerAccount = await prisma.customerProfile.findUnique({
    where: {
      userId: bookingData.userId,
    },
  });
  console.log(customerAccount,"check customer account")
  if (!customerAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, "customer account not found");
  }
  const payment = await stripeService.createPaymentIntentIntoDB(
    bookingData,
    customerAccount.stripeCustomerId
  );
  return payment
};
const bookingLive=async (bookingData: any) => {
  const customerAccount = await prisma.customerProfile.findUnique({
    where: {
      userId: bookingData.userId,
    },
  });
  console.log(customerAccount,"check customer account")
  if (!customerAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, "customer account not found");
  }
  const payment = await stripeService.createPaymentIntentIntoDB(
    bookingData,
    customerAccount.stripeCustomerId
  );
  return payment
};

export const bookingService = { createBooking ,bookingLive};
