import {  Response } from "express";
import catchAsync from "../../../shared/catchAsync";

import sendResponse from "../../../shared/sendResponse";
import { eventService } from "./event.service";
import pick from "../../../shared/pick";
import { paginationFileds } from "../../../helpers/paginationOptions";
import { filterableField } from "../../../helpers/searchableFields";
import httpStatus from "http-status";

//login user

// get profile for logged in user
const createEvent = catchAsync(async (req: any, res: Response) => {

  const user = req.user;
  const eventData = { ...req.body, userId: user.id,email:user.email };
  const data = await eventService.createEvent(eventData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event Create Successfully",
    data: data,
  });
});
const getAllEvents = catchAsync(async (req: any, res: Response) => {
  const paginationOptions = pick(req.query, paginationFileds);
  const filters = pick(req.query, filterableField);
  const data = await eventService.getAllEvents(filters, paginationOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event get Successfully",
    data: data,
  });
});
const getSingleEvent = catchAsync(async (req: any, res: Response) => {

  const data = await eventService.getSingleEvent(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Single Event get Successfully",
    data: data,
  });
});



export const eventController = {
  createEvent,
  getAllEvents,
  getSingleEvent
};
