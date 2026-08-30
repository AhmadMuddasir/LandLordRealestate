import createHttpError from "http-errors";
import fs from "fs";
import mongoose from "mongoose";

import propertyModel from "./propertyModel.js";

import { uploadAndCompressImage } from "../config/cloudinary.js";

import cloudinary from "../config/cloudinary.js";



const deleteTempFiles = (files = []) => {
  for (const file of files) {
    try {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error("Error deleting temporary file:", error);
    }
  }
};



const createProperty = async (req, res, next) => {
  const files = req.files || [];
  const uploadedImages = [];

  try {
    const {
      ownerName,
      contactNumber,
      propertyType,
      location,
      price,
      areaSize,
      description,
    } = req.body;

    // Validate fields
    if (
      !ownerName ||
      !contactNumber ||
      !propertyType ||
      !location ||
      !price ||
      !areaSize ||
      !description
    ) {
      deleteTempFiles(files);

      return next(createHttpError(400, "All fields are required"));
    }

    // Validate images
    if (files.length === 0) {
      return next(createHttpError(400, "At least one image is required"));
    }

    if (files.length > 5) {
      deleteTempFiles(files);

      return next(createHttpError(400, "Maximum 6 images are allowed"));
    }

 

    const uploadedResults = await Promise.all(
      files.map((file) =>
        uploadAndCompressImage(file.path, "realestate/properties"),
      ),
    );

    uploadedImages.push(...uploadedResults);



    const property = await propertyModel.create({
      ownerName: ownerName.trim(),
      contactNumber: contactNumber.trim(),
      propertyType,
      location: location.trim(),
      price: Number(price),
      areaSize: areaSize.trim(),
      description: description.trim(),

      images: uploadedImages,

      creator_id: req.userId,
    });

    // Delete temporary files
    deleteTempFiles(files);

    return res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    // Delete images already uploaded to Cloudinary
    for (const image of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (deleteError) {
        console.error("Failed to delete uploaded image:", deleteError);
      }
    }

    // Delete temporary files
    deleteTempFiles(files);

    return next(createHttpError(500, "Error while creating property"));
  }
};



const getAllProperties = async (req, res, next) => {
  try {
    const limit = Math.min(
      Number(req.query.limit) || 24,
      50
    );

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const skip = (page - 1) * limit;

    const properties = await propertyModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      count: properties.length,
      properties,
      page,
      limit,
    });

  } catch (error) {
    console.error(
      "Get properties error:",
      error
    );

    return next(
      createHttpError(
        500,
        "Error while fetching properties"
      )
    );
  }
};

// =====================================================
// GET SINGLE PROPERTY
// =====================================================

const getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid property ID"));
    }

    const property = await propertyModel.findById(id);

    if (!property) {
      return next(createHttpError(404, "Property not found"));
    }

    return res.status(200).json({
      property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    return next(createHttpError(500, "Error while fetching property"));
  }
};

// =====================================================
// SEARCH BY LOCATION
// =====================================================

const searchProperties = async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location || !location.trim()) {
      return next(createHttpError(400, "Location search is required"));
    }

    const properties = await propertyModel.find({
      location: {
        $regex: location.trim(),
        $options: "i",
      },
    });

    return res.status(200).json({
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Search property error:", error);

    return next(createHttpError(500, "Error while searching properties"));
  }
};

// =====================================================
// UPDATE PROPERTY
// =====================================================

const updateProperty = async (req, res, next) => {
  const files = req.files || [];
  const uploadedImages = [];

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      deleteTempFiles(files);

      return next(createHttpError(400, "Invalid property ID"));
    }

    const property = await propertyModel.findById(id);

    if (!property) {
      deleteTempFiles(files);

      return next(createHttpError(404, "Property not found"));
    }

    // Check ownership
    if (property.creator_id.toString() !== req.userId.toString()) {
      deleteTempFiles(files);

      return next(
        createHttpError(403, "You are not allowed to update this property"),
      );
    }

    // ================================================
    // Update text fields
    // ================================================

    const {
      ownerName,
      contactNumber,
      propertyType,
      location,
      price,
      areaSize,
      description,
      status,
    } = req.body;

    if (ownerName !== undefined) property.ownerName = ownerName.trim();

    if (contactNumber !== undefined)
      property.contactNumber = contactNumber.trim();

    if (propertyType !== undefined) property.propertyType = propertyType;

    if (location !== undefined) property.location = location.trim();

    if (price !== undefined) property.price = Number(price);

    if (areaSize !== undefined) property.areaSize = areaSize.trim();

    if (description !== undefined) property.description = description.trim();

    if (status !== undefined) property.status = status;



    if (files.length > 0) {
      if (files.length > 5) {
        deleteTempFiles(files);

        return next(createHttpError(400, "Maximum 6 images are allowed"));
      }

      // Upload NEW images first
const uploadedResults = await Promise.all(
  files.map((file) =>
    uploadAndCompressImage(
      file.path,
      "realestate/properties"
    )
  )
);

uploadedImages.push(...uploadedResults);

      // Delete OLD images from Cloudinary
      for (const oldImage of property.images) {
        if (oldImage.public_id) {
          try {
            await cloudinary.uploader.destroy(oldImage.public_id);
          } catch (error) {
            console.error("Failed to delete old Cloudinary image:", error);
          }
        }
      }

      // Replace old images
      property.images = uploadedImages;
    }

    await property.save();

    // Delete temporary files
    deleteTempFiles(files);

    return res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Update property error:", error);

    // Delete newly uploaded Cloudinary images
    for (const image of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (deleteError) {
        console.error("Failed to delete uploaded image:", deleteError);
      }
    }

    deleteTempFiles(files);

    return next(createHttpError(500, "Error while updating property"));
  }
};

// =====================================================
// DELETE PROPERTY
// =====================================================

const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid property ID"));
    }

    const property = await propertyModel.findById(id);

    if (!property) {
      return next(createHttpError(404, "Property not found"));
    }

    // Check ownership
    if (property.creator_id.toString() !== req.userId.toString()) {
      return next(
        createHttpError(403, "You are not allowed to delete this property"),
      );
    }

    // Delete Cloudinary images
    for (const image of property.images) {
      if (image.public_id) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (error) {
          console.error("Failed to delete Cloudinary image:", error);
        }
      }
    }

    // Delete MongoDB property
    await propertyModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Property and images deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    return next(createHttpError(500, "Error while deleting property"));
  }
};



export {
  createProperty,
  getAllProperties,
  getProperty,
  searchProperties,
  updateProperty,
  deleteProperty,
};
