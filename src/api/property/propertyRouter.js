import express from "express";

import {
  createProperty,
  getAllProperties,
  getProperty,
  searchProperties,
  updateProperty,
  deleteProperty,
} from "./propertyController.js";

import upload from "../middlewares/upload.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();



// Create property
router.post(
  "/",
  authentication,
  upload.array("images", 6),
  createProperty
);


// Get all properties
router.get(
  "/",
  getAllProperties
);


// Search properties by location
router.get(
  "/search",
  searchProperties
);


// Get single property
router.get(
  "/:id",
  getProperty
);


// Update property
router.put(
  "/:id",
  authentication,
  upload.array("images", 6),
  updateProperty
);


// Delete property
router.delete(
  "/:id",
  authentication,
  deleteProperty
);


export default router;