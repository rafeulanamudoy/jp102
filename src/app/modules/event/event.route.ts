import express from "express";
import { eventController } from "./event.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

//login user
router.post(
  "/create-event",
  auth(UserRole.ORGANIZER),
  eventController.createEvent
);
router.get("/get-all-events",eventController.getAllEvents)
router.get("/:id",eventController.getSingleEvent)

export const eventRoute = router;
