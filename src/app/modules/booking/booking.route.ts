import express from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middlewares/auth";



const router = express.Router();


router.post("/create-booking",auth(),bookingController.createBooking)
router.post("/booking-live",bookingController.bookingLive)
export const bookingRoute = router;
