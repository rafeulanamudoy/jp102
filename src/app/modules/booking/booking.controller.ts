



import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

import { Response } from "express";
import { bookingService } from "./booking.service";


const createBooking = catchAsync(async (req: any, res: Response) => {

  const user = req.user;
  const bookingDAta = { ...req.body, userId: user.id,email:user.email };
  const data = await bookingService.createBooking(bookingDAta);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event Book  Successfully",
    data: data,
  });
});

const bookingLive = catchAsync(async (req: any, res: Response) => {

  const user = req.user;
  const bookingDAta = { ...req.body, userId: user.id,email:user.email };
  const data = await bookingService.bookingLive(bookingDAta);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event Book  Successfully",
    data: data,
  });
});


export const bookingController = {
  createBooking,
  bookingLive
}