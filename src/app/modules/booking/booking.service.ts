import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { stripeService } from "../stripe/stripe.service";
import { IpaginationOptions } from "../../../helpers/paginationOptions";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";

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

const getUserTicket=async(ticketId:string)=>{


  const result=await  prisma.ticket.findUnique({
    where:{
    
      id:ticketId
    },
    
    include:{
      booking:{
        select:{
          totalSeat:true
        }
      },
      event:{
        select:{
          startTime:true,
          selectedDate:true
        }
      }
    }
    
  })
  return result
}
const getUserVoucher=async(voucherId:string)=>{


  const result=await  prisma.voucher.findUnique({
    where:{
    
      id:voucherId
    }, include:{
     
      event:{
        select:{
          startTime:true,
          selectedDate:true
        }
      }
    }
    
  })
  return result
}
const getUserBooking = async (
  filters: any,
  paginationOptions: IpaginationOptions,
  userId: string
) => {
  const { skip, limit, page, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { query, ...filtersData } = filters;
  let finalLimit = limit;
  let orderByCondition = { [sortBy]: sortOrder };

  const andCondition: Prisma.EventWhereInput[] = [];

  if (filtersData.type) {
    andCondition.push({ eventType: { in: JSON.parse(filtersData.type) } });
  }


  const currentTime = new Date();
  let bookingFilter: Prisma.BookingWhereInput = {};

  if (query === "completed") {
    bookingFilter = {
      event: {
        endTime: { lt: currentTime }, 
      },
    };
  } else if (query === "active") {
    bookingFilter = {
      event: {
        startTime: { gt: currentTime },
      },
    };
  }

  const result = await prisma.booking.findMany({
    where: {
      userId: userId,
      ...bookingFilter, 
    },
    skip,
    take: finalLimit,
    orderBy: orderByCondition,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          eventName: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  const count = await prisma.booking.count({
    where: {
      userId: userId,
      ...bookingFilter,
    },
  });

  return {
    meta: { page, limit: finalLimit, count },
    data: result,
  };
};

export const bookingService = { createBooking ,bookingLive,getUserTicket,getUserVoucher,getUserBooking};
