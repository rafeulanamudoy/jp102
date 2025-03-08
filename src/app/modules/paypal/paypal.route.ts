import express from "express";
// import { paypalControllers } from "./paypal.controller";


const router = express.Router();

// Create a new payment session


// router.post("/payment-webhook",  express.raw({ type: "application/json" }),StripeController.saveTransactionBillingAndOrder)
// router.post("/create-order",paypalControllers.createOrder)
// router.post("/capture-payment",paypalControllers.capturePayment),
// router.patch("/complete-order",paypalControllers.completeOrder)

export const paypalRoute = router;