import express from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middlewares/auth";



const router = express.Router();


router.post("/create-booking",auth(),bookingController.createBooking)
router.post("/booking-live",auth(),bookingController.bookingLive)
router.get("/get-ticket/:ticketId",auth(),bookingController.getUserTicket)
router.get("/get-voucher/:voucherId",bookingController.getUserVoucher)
router.get("/get-booking",auth(),bookingController.getUserBooking)
router.post("/cancel-booking/:bookingId",auth(),bookingController.cancelBooking)
export const bookingRoute = router;
