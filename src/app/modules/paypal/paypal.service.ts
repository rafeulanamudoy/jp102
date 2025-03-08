// import axios from 'axios';
// import config from '../../../config';

// import httpStatus from 'http-status';
// import prisma from '../../../shared/prisma';
// import ApiError from '../../../errors/ApiErrors';



//  const generateAccessToken = async () => {
//   const auth = Buffer.from(
//     `${config.paypal.clientId}:${config.paypal.clientSecret}`,
//   ).toString('base64');
//   const response = await axios({
//     url: `${config.paypal.paypal_base_url}/v1/oauth2/token`,
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       Authorization: `Basic ${auth}`,
//     },
//     data: 'grant_type=client_credentials',
//   });
//   return response.data.access_token;
// };

//  const getPaypalOrder = async (orderId: string) => {
//   const access_token = await generateAccessToken();
//   const response = await axios({
//     url: `${config.paypal.paypal_base_url}/v2/checkout/orders/${orderId}`,
//     method: 'get',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${access_token}`,
//     },
//   });
//   return response;
// };

//  const createOrder = async (
//   amount: string,
//   userId: string,
//   purpose: string,
// ) => {


//   const findCustomer=await prisma.user.findUnique({where:{
//     id:userId
//   },include:{
//     CustomerProfile:true
//   }})
//   if(!findCustomer?.CustomerProfile){
//     throw new ApiError(httpStatus.UNAUTHORIZED,"customer not found")
//   }
//   const access_token = await generateAccessToken();
//   const response = await axios({
//     url: `${config.paypal.paypal_base_url}/v2/checkout/orders`,
//     method: 'post',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${access_token}`,
//     },
//     data: {
//       intent: 'CAPTURE',
//       purchase_units: [
//         {
//           amount: {
//             currency_code: 'USD',
//             value: amount,
//           },
//         },
//       ],
//       application_context: {
//         return_url: `${config.frontend_base_url}/complete-order?userId=${userId}&purpose=${purpose}`,
//         cancel_url: `http://facebook.com`,
//       },
//     },
//   });

//   return response.data;
// };

//  const captureOrder = async (orderId: string) => {
//   const access_token = await generateAccessToken();
  
//   const response = await axios({
//     url: `${config.paypal.paypal_base_url}/v2/checkout/orders/${orderId}/capture`,
//     method: 'post',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${access_token}`,
//     },
//   });
  

//   return response.data;
// };
// const completeOrder = async (
//   userId: string,
//   orderId: string,
//   purpose: string,
//   customer_billing_address:any,
//   products:any
// ) => {

//   const payment = await captureOrder(orderId);
 

//   if (!payment || !payment.purchase_units[0].payments) {
//     throw new Error('Invalid payment response from PayPal');
//   }
//   const amount = parseFloat(payment.purchase_units[0].payments.captures[0]?.amount?.value);
//   const captureId=payment.purchase_units[0].payments.captures[0]?.id
 

//   if (!amount || payment.status !== "COMPLETED") {
//     throw new Error('Payment not completed ');
//   }
//   const findCustomer = await prisma.user.findUnique({
//     where: { id: userId },
//     include: { customer: true },
//   });
   
//   return prisma
//   .$transaction(async (prisma) => {
//     if (!findCustomer || !findCustomer.customer) {
//       throw new ApiError(httpStatus.UNAUTHORIZED, "Customer not found");
//     }
//     const billingAddress = await prisma.billingAddress.create({
//       data: { ... customer_billing_address },
//     });

//     await prisma.cartModel.deleteMany({
//       where: { customerId: findCustomer.customer.id },
//     });
//     const order = await prisma.orderModel.create({
//       data: {
//         customerId: findCustomer.customer.id,
//         totalAmount: amount,
//         paypalOrderId: payment.purchase_units[0].payments.captures[0]?.id,
//         billingAddressId: billingAddress.id,
//       },
//     });

//     for (const product of products) {
//       await prisma.orderProduct.create({
//         data: {
//           orderId: order.id,
//           productId: product.id,
//           productQuantity: product.quantity,
//         },
//       });
//     }

//     const transaction = await prisma.transactionModel.create({
//       data: {
//         customerId: findCustomer.customer.id,
//         orderId: order.id,
//         amount:amount,
//         paymentMethod: "paypal",
//       },
//     });

//     return { order, transaction, billingAddress };
//   }).catch((error) => {
//     console.error("Error saving transaction and order:", error);
//     throw new Error("Error saving transaction and order.");
//   })
  
//   }
  


//   const refundPayment = async (captureId: string) => {
  
//     const access_token = await generateAccessToken();
  
//     try {
//       const response = await axios.post(
//         `${config.paypal.paypal_base_url}/v2/payments/captures/${captureId}/refund`,
//         {}, 
//         {
//           headers: {
//             Authorization: `Bearer ${access_token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
  
//       return response.data; 
//     } catch (error:any) {
//       console.error("PayPal refund error:", error.response?.data || error.message);
//       throw new Error("PayPal refund failed");
//     }
//   };
  
//   export default { refundPayment };
  

// export  const paypalService={
//     generateAccessToken,
//     captureOrder,
//     createOrder,
//     getPaypalOrder,
//     completeOrder,
//     refundPayment

// }