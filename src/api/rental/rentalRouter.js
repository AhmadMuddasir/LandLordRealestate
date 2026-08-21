import express from "express";

import {
  createRental,
  getAllRentals,
  getRental,
  searchRentals,
  updateRental,
  deleteRental,
} from "./rentalController.js";

import authenticate from "../middlewares/authentication.js";
import upload from "../middlewares/upload.js";

const router = express.Router();


// Create rental
router.post(
  "/",
  authenticate,
  upload.array("images", 6),
  createRental
);


// Get all rentals
router.get(
  "/",
  getAllRentals
);


// Search rental by location
router.get(
  "/search",
  searchRentals
);


// Get single rental
router.get(
  "/:id",
  getRental
);


// Update rental
router.put(
  "/:id",
  authenticate,
  upload.array("images", 6),
  updateRental
);


// Delete rental
router.delete(
  "/:id",
  authenticate,
  deleteRental
);


export default router;