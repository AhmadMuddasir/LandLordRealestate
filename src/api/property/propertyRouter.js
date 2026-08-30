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

router.post("/", authentication, upload.array("images", 6), createProperty);

router.get("/", getAllProperties);

router.get("/search", searchProperties);

router.get("/:id", getProperty);

router.put("/:id", authentication, upload.array("images", 6), updateProperty);

router.delete("/:id", authentication, deleteProperty);

export default router;
