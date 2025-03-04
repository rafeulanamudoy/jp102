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
export const bookingService = { createBooking ,bookingLive,getUserTicket,getUserVoucher};
