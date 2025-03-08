import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoute } from "../modules/auth/auth.routes";
import { eventRoute } from "../modules/event/event.route";
import { stripeRoute } from "../modules/stripe/stripe.route";
import { bookingRoute } from "../modules/booking/booking.route";
import { paypalRoute } from "../modules/paypal/paypal.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },

  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/event",
    route: eventRoute,
  },
  {
    path: "/stripe",
    route: stripeRoute,
  },
  {
    path: "/paypal",
    route: paypalRoute,
  },

  {
    path: "/booking",
    route: bookingRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
