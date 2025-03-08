// import { Request, Response } from 'express';
// import httpStatus from 'http-status';
// import catchAsync from '../../../shared/catchAsync';
// import sendResponse from '../../../shared/sendResponse';
// import { paypalService } from './paypal.service';
// import prisma from '../../../shared/prisma';
// import ApiError from '../../../errors/ApiErrors';
// const createOrder = async (req: Request, res: Response) => {
//     try {
//       const { amount, userId, purpose } = req.body;
  
//       // Validate input
//       if (!amount || !userId || !purpose) {
//         return res.status(400).json({
//           success: false,
//           message: 'Missing required fields: amount, userId, or purpose',
//         });
//       }
//      const user=await prisma.user.findUnique({where:{
//       id:userId
//      },include:{
//       customer:true
//      }})

    

//      if(!user?.customer){
//       throw new ApiError(httpStatus.UNAUTHORIZED,"customer not found give a valid user id")
//      }
//       // Call the PayPal service to create an order
//       const order = await paypalService.createOrder(amount, userId, purpose);
  
//       res.status(201).json({
//         success: true,
//         message: 'Order created successfully',
//         data: order,
//       });
//     } catch (error:any) {
//       console.error('Error creating PayPal order:', error.message);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to create order',
//         error: error.message,
//       });
//     }
//   };
//   const capturePayment = async (req: Request, res: Response) => {
//     try {
//       const { token } = req.query;
   
  
//       // Validate input
//       if (typeof token !== 'string') {
//         throw new ApiError(httpStatus.UNAUTHORIZED,"invalid token found when capture payment hit")
//       }
  
   
//       const order = await paypalService.captureOrder(token);
  
//       res.status(201).json({
//         success: true,
//         message: 'Order capture successfully',
//         data: order,
//       });
//     } catch (error:any) {
//       console.error('Error creating PayPal order:', error.message);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to create order',
//         error: error.message,
//       });
//     }
//   };
//   const completeOrder = catchAsync(async (req: Request, res: Response) => {
//     const userId = req.query.userId as string;
//     const orderId = req.query.token as string;
//     const purpose = req.query.purpose as string;
//     const billingAddress=req.body.billing_address_collection;
//     const products=req.body.product
//     const result = await paypalService.completeOrder(userId, orderId, purpose,billingAddress,products);
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'order  complete  successful.',
//       data: result,
//     });
//   });
//   export const paypalControllers = {
//     createOrder,
//     capturePayment,
//     completeOrder
//   };

