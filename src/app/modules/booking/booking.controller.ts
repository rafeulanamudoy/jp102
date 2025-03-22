



import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

import { Response } from "express";
import { bookingService } from "./booking.service";
import pick from "../../../shared/pick";
import { paginationFileds } from "../../../helpers/paginationOptions";
import { filterableField } from "../../../helpers/searchableFields";


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

const getUserTicket = catchAsync(async (req: any, res: Response) => {

  const user = req.user;
  const ticketId=req.params.ticketId


  const data=await bookingService.getUserTicket(ticketId)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Singe voucher Get Successfully",
    data: data,
  });
});
const getUserVoucher= catchAsync(async (req: any, res: Response) => {

  const user = req.user;
  const voucherId=req.params.voucherId



  const data=await bookingService.getUserVoucher(voucherId)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Singe Ticket Get Successfully",
    data: data,
  });
});
const getUserBooking = catchAsync(async (req: any, res: Response) => {


  const filters = pick(req.query, filterableField);
  console.log(filters,"check filters")
  const paginationOptions = pick(req.query, paginationFileds);
  const user=req.user
  const data = await bookingService.getUserBooking(filters, paginationOptions,user.id);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "user booking get successfully",
    data: data,
  });
});

const cancelBooking = catchAsync(async (req: any, res: Response) => {
   const user=req.body
  const bookingId=req.params.bookingId
 
  const data = await bookingService.cancelBooking(user.id,bookingId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "booking cancel   successfully",
    data: data,
  });
});

export const bookingController = {
  createBooking,
  bookingLive,
  getUserTicket,
  getUserVoucher,
  getUserBooking,
  cancelBooking

}