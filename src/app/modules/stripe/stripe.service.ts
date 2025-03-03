import Stripe from "stripe";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { isValidAmount } from "../../../utilities/isValidAmount";
import { generateNewAccountLink } from "../../../utilities/generateLink";
import { ObjectId } from "mongodb";
import httpStatus from "http-status";
import { generateQRCode } from "../../../helpers/generateQrCode";

const stripe = new Stripe(config.stripe.secretKey as string);

const createCustomer = async (payload: any) => {
  const customer = await stripe.customers.create({
    email: payload.email,
    name: payload.username,
  });
  return customer;
};
const createMerchentAccount = async (payload: any) => {
  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: payload.email,
  });

  const user = await prisma.organizerProfile.create({
    data: {
      stripeAccountId: account.id,

      userId: payload.userId,
    },
  });

  await generateNewAccountLink(account, payload);
  return account;
};
const isDuplicateStripecard = async (
  paymentMethodId: string,
  stripeCustomerId: string
) => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });
  const newCard: any = await stripe.paymentMethods.retrieve(paymentMethodId);

  const duplicateCards = paymentMethods?.data?.filter(
    (existingCard: any) => existingCard.card.last4 === newCard.card.last4
  );

  return duplicateCards;
};

// create payment intent
const createPaymentIntentIntoDB = async (
  payload: any,
  stripeCustomerId: string
) => {
  if (!payload.totalPrice) {
    throw new ApiError(400, "Amount is required");
  }

  if (!isValidAmount(payload.totalPrice)) {
    throw new ApiError(
      400,
      `Amount '${payload.totalPrice}' is not a valid amount`
    );
  }

  const totalAmount = Math.round(payload.totalPrice * 100);

  const merchant = await prisma.event.findUnique({
    where: { id: payload.eventId },
    include: {
      user: {
        select: {
          OrganizerProfile: true,
        },
      },
    },
  });

  const platformFee = Math.round(totalAmount * 0.2);
  const amountForMerchant = totalAmount - platformFee;
  const ticketId = new ObjectId().toString();
  const qrCode = await generateQRCode(ticketId);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: "usd",
    customer: stripeCustomerId,
    setup_future_usage: JSON.parse(payload.session)
      ? "on_session"
      : "off_session",
    payment_method: payload.paymentMethodId,
    confirm: true,

    transfer_data: {
      destination: merchant?.user?.OrganizerProfile?.stripeAccountId as string,
      amount: amountForMerchant,
    },

    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  });

  if (paymentIntent.status === "succeeded") {
    const result = await prisma.booking.create({
      data: {
        paymentType: payload.paymentType,
        eventId: payload.eventId,
        totalPrice: payload.totalPrice,
        totalSeat: payload.totalSeat,
        ticketType: payload.ticketType,
        userId: payload.userId,

        paymentIntentId: paymentIntent.id,
        isPaid: true,
        Ticket: {
          create: {
            id: ticketId,

            userId: payload.userId,
            eventId: payload.eventId,

            ticketType: payload.ticketType,
            qrCode: qrCode,
          },
        },
      },
    });


    return result;
  } else {
    throw new ApiError(400, "Payment was not successful.");
  }
};

// get stripe card
const getStripeCardIntoDB = async (stripeCustomerId: string) => {
  const result = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });

  return result;
};

// stripe card save
const createStripeCardIntoDB = async (
  paymentMethodId: string,
  stripeCustomerId: string
) => {
  const existingCard: any = await isDuplicateStripecard(
    paymentMethodId,
    stripeCustomerId
  );

  if (existingCard?.length === 0) {
    const result = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });
    return result;
  } else {
    throw new ApiError(
      404,
      `The card you are trying to add is already linked to your account.`
    );
  }
};

// delete stripe card
const deleteStripeCardIntoDB = async (paymentMethodId: string) => {
  const result = await stripe.paymentMethods.detach(paymentMethodId);
  return result;
};

export const stripeService = {
  createPaymentIntentIntoDB,
  getStripeCardIntoDB,
  createStripeCardIntoDB,
  deleteStripeCardIntoDB,
  createCustomer,
  createMerchentAccount,
};
