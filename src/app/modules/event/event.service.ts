import { Prisma } from "@prisma/client";
import { IpaginationOptions } from "../../../helpers/paginationOptions";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import {
  startOfDay,
  endOfDay,
  addDays,
  parse,
  format,
  formatISO,
} from "date-fns";

import Stripe from "stripe";
import config from "../../../config";
import { generateNewAccountLink } from "../../../utilities/generateLink";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { stripeService } from "../stripe/stripe.service";

const stripe = new Stripe(config.stripe.secretKey as string);
const createEvent = async (payload: any) => {
  try {
    let user = await prisma.organizerProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!user) {
      await stripeService.createMerchentAccount(payload);
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Complete your onboarding. A link has been sent to your email."
      );
    }

    const stripeAccount = await stripe.accounts.retrieve(
      user.stripeAccountId as string
    );

    if (!stripeAccount.charges_enabled) {
      await generateNewAccountLink(stripeAccount, payload);
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Complete your onboarding. A link has been sent to your email."
      );
    }

    const selectedDate = new Date(payload.selectedDate);
    const formatDateTime = (time: string) =>
      parse(
        `${format(selectedDate, "yyyy-MM-dd")} ${time}`,
        "yyyy-MM-dd h:mm a",
        new Date()
      );

    const startDateTime = formatDateTime(payload.startTime);
    let endDateTime = formatDateTime(payload.endTime);

    if (format(endDateTime, "h:mm a") === "12:00 AM") {
      endDateTime = addDays(endDateTime, 1);
    }

    if (endDateTime <= startDateTime) {
      throw new Error("End time must be after start time.");
    }

    const formattedEventData = {
      eventDesc: payload.eventDesc,
      eventName: payload.eventName,
      eventType: payload.eventType,
      selectedDate: formatISO(selectedDate, { representation: "complete" }),
      startTime: formatISO(startDateTime),
      endTime: formatISO(endDateTime),
      economySeatCount: payload.economySeatCount,
      economySeatPrice: payload.economySeatPrice,
      vipSeatCount: payload.vipSeatCount,
      vipSeatPrice: payload.vipSeatPrice,
      userId: payload.userId,
      eventLocation: {
        create: {
          city: payload.city,
          lat: payload.lat,
          long: payload.long,
          state: payload.state,
          zipCode: payload.zipCode,
          userId: payload.userId,
        },
      },
    };

    return await prisma.event.create({ data: formattedEventData });
  } catch (error: any) {
    console.error("Error creating event:", error);
    throw new Error(
      error.message || "An error occurred while creating the event."
    );
  }
};

const getAllEvents = async (
  filters: any,
  paginationOptions: IpaginationOptions
) => {
  const { skip, limit, page, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);
  // console.log(sortBy, "check sortBy");
  // console.log(sortOrder, "check sortOrder");

  const { query, ...filtersData } = filters;

  // console.log(filtersData, "check filterdata from service");
  // console.log(query, "check query from service file");

  let finalLimit = limit;
  let orderByCondition = { [sortBy]: sortOrder };
  const andCondition: Prisma.EventWhereInput[] = [];
  if (query) {
    andCondition.push({
      OR: [{ eventName: { contains: query as string, mode: "insensitive" } }],
    });
  }

  if (filtersData.type) {
    andCondition.push({ eventType: { in: JSON.parse(filtersData.type) } });
  }

  if (filtersData.featured) {
    andCondition.push({ selectedDate: { gte: startOfDay(new Date()) } });
    orderByCondition = { selectedDate: "asc" };
  }

  if (filtersData.popular) {
    orderByCondition = { enrollCount: "desc" };
  }

  if (filtersData.timeBase) {
    const now = new Date();

    andCondition.push({
      selectedDate: {
        gte: startOfDay(now),
        lte: endOfDay(now),
      },
      startTime: {
        lte: now,
      },
      endTime: {
        gte: now,
      },
    });
  }
  if (filtersData.timeByDate === "today") {
    andCondition.push({
      selectedDate: {
        gte: startOfDay(new Date()),
        lte: endOfDay(new Date()),
      },
    });
  }

  if (filtersData.timeByDate === "tomorrow") {
    const tomorrow = addDays(new Date(), 1);
    andCondition.push({
      selectedDate: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
    });
  }

  if (filtersData.timeByDate === "week") {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    andCondition.push({
      selectedDate: {
        gte: startOfDay(today),
        lte: endOfDay(nextWeek),
      },
    });
  }
  if (filtersData.city && filtersData.state) {
    andCondition.push({
      eventLocation: {
        some: {
          city: { equals: filtersData.city, mode: "insensitive" },
          state: { equals: filtersData.state, mode: "insensitive" },
        },
      },
    });
  }
  const whereConditions: Prisma.EventWhereInput = {
    AND: andCondition.length > 0 ? andCondition : undefined,
  };
  const result = await prisma.event.findMany({
    where: whereConditions,
    skip,
    orderBy: orderByCondition,

    take: finalLimit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      eventLocation: {
        select: {
          city: true,
          state: true,
          zipCode: true,
          lat: true,
          long: true,
        },
      },
    },
  });

  const count = await prisma.event.count({ where: whereConditions });
  return {
    meta: { page, limit: finalLimit, count },
    data: result,
  };
};

//  const getEventsByLocation=async(lat:number,long:number)=>{
//   const events=await prisma.event.findMany({
//     where:{
//       eventLocation:{
//         some:
//       }
//     }
//   })

const getSingleEvent = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: {
      id: id,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  return event;
};

export const eventService = { createEvent, getAllEvents, getSingleEvent };
