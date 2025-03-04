import express from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middlewares/auth";



const router = express.Router();


router.post("/create-booking",auth(),bookingController.createBooking)
router.post("/booking-live",auth(),bookingController.bookingLive)
router.get("/get-ticket/:ticketId",auth(),bookingController.getUserTicket)
router.get("/get-voucher/:voucherId",bookingController.getUserVoucher)
export const bookingRoute = router;
