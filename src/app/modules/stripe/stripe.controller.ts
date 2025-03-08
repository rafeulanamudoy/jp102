import Stripe from "stripe";
import catchAsync from "../../../shared/catchAsync";
import config from "../../../config";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { stripeService } from "./stripe.service";


const stripe = new Stripe(config.stripe.secretKey as string);
// web hook
const handleWebHook = catchAsync(async (req: any, res: any) => {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Missing Stripe signature header.",
      data: null,
    });
  }

  let event: Stripe.Event;

  try {
    // Pass raw body (Buffer) to Stripe's constructEvent
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret as string
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return res.status(400).send("Webhook Error: Invalid signature.");
  }

  // Handle the event types
  switch (event.type) {
    case "account.updated":
      const account = event.data.object;
      console.log(account, "check account from webhook");

      if (
        account.charges_enabled &&
        account.details_submitted &&
        account.payouts_enabled
      ) {
        console.log(
          "Onboarding completed successfully for account:",
          account.id
        );
      } else {
        console.log("Onboarding incomplete for account:", account.id);
      }
      break;

    // Other event types
    case "capability.updated":
      console.log("Capability updated event received. Handle accordingly.");
      break;
    case "charge.refunded":
    case "charge.refund.updated":
      console.log(`${event.type}`);
      break;

    case "financial_connections.account.created":
      console.log(
        "Financial connections account created event received. Handle accordingly."
      );
      break;

    case "account.application.authorized":
      const authorizedAccount = event.data.object;
      console.log("Application authorized for account:", authorizedAccount.id);
      break;

    case "customer.created":
      const customer = event.data.object;
      console.log("New customer created:", customer.id);
      break;

    case "account.external_account.created":
      const externalAccount = event.data.object;
      console.log("External account created:", externalAccount);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send("Event received");
});

// payment intent
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const stripeCustomerId = req.user.stripeCustomerId as string;
 console.log(stripeCustomerId,"check stripe customer id")

  const payload = req.body;

  const result = await stripeService
  .createPaymentIntentIntoDB(
    payload,
 
    stripeCustomerId,
   
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment created successfully",
    data: result,
  });
});

// get stripe card
const getStripeCard = catchAsync(async (req: Request, res: Response) => {
  const stripeCustomerId = req.user.stripeCustomerId as string;
  const result = await stripeService.getStripeCardIntoDB(stripeCustomerId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Stripe card retrived successfully",
    data: result,
  });
});

// create stripe card
const createStripeCard = catchAsync(async (req: Request, res: Response) => {
  const stripeCustomerId = req.user.stripeCustomerId as string;
  const paymentMethodId = req.body.paymentMethodId as string;

  const result = await stripeService.createStripeCardIntoDB(
    paymentMethodId,
    stripeCustomerId
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Card save successfully",
    data: result,
  });
});

// delete stripe card
const deleteStripeCard = catchAsync(async (req: Request, res: Response) => {
  const paymentMethodId = req.params.id as string;
  const result = await stripeService.deleteStripeCardIntoDB(paymentMethodId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Card delete successfully",
    data: result,
  });
});

export const bookingController = {
  createPaymentIntent,
  handleWebHook,
  getStripeCard,
  createStripeCard,
  deleteStripeCard,
};
