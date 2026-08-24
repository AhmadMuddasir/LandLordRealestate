import createHttpError from "http-errors";
import fs from "fs";
import mongoose from "mongoose";

import rentalModel from "./rentalModel.js";

import { uploadAndCompressImage } from "../config/cloudinary.js";

import cloudinary from "../config/cloudinary.js";

// Delete temporary Multer files

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

// CREATE RENTAL

const createRental = async (req, res, next) => {
  const files = req.files || [];
  const uploadedImages = [];

  try {
    const {
      ownerName,
      contactNumber,
      propertyType,
      location,
      monthlyRent,
      areaSize,
      description,
    } = req.body;

    // Validate required fields
    if (
      !ownerName ||
      !contactNumber ||
      !propertyType ||
      !location ||
      !monthlyRent ||
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

      return next(createHttpError(400, "Maximum 5 images are allowed"));
    }

    // Upload images to Cloudinary
    const uploadedResults = await Promise.all(
      files.map((file) =>
        uploadAndCompressImage(file.path, "realestate/properties"),
      ),
    );

    uploadedImages.push(...uploadedResults);

    // Create rental
    const rental = await rentalModel.create({
      ownerName: ownerName.trim(),
      contactNumber: contactNumber.trim(),
      propertyType,
      location: location.trim(),
      monthlyRent: Number(monthlyRent),
      areaSize: areaSize.trim(),
      description: description.trim(),
      images: uploadedImages,
      creator_id: req.userId,
    });

    // Delete temporary files
    deleteTempFiles(files);

    return res.status(201).json({
      message: "Rental created successfully",
      rental,
    });
  } catch (error) {
    console.error("Create rental error:", error);

    // Delete uploaded Cloudinary images
    for (const image of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (deleteError) {
        console.error("Failed to delete Cloudinary image:", deleteError);
      }
    }

    // Delete temporary files
    deleteTempFiles(files);

    return next(createHttpError(500, "Error while creating rental"));
  }
};

// GET ALL RENTALS

const getAllRentals = async (req, res, next) => {
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

    const rentals = await rentalModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      count: rentals.length,
      rentals,
      page,
      limit,
    });

  } catch (error) {
    console.error(
      "Get rentals error:",
      error
    );

    return next(
      createHttpError(
        500,
        "Error while fetching rentals"
      )
    );
  }
};

// GET SINGLE RENTAL

const getRental = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid rental ID"));
    }

    const rental = await rentalModel.findById(id);

    if (!rental) {
      return next(createHttpError(404, "Rental not found"));
    }

    return res.status(200).json({
      rental,
    });
  } catch (error) {
    console.error("Get rental error:", error);

    return next(createHttpError(500, "Error while fetching rental"));
  }
};

// SEARCH RENTALS BY LOCATION

const searchRentals = async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location || !location.trim()) {
      return next(createHttpError(400, "Location search is required"));
    }

    const rentals = await rentalModel
      .find({
        location: {
          $regex: location.trim(),
          $options: "i",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Rental search error:", error);

    return next(createHttpError(500, "Error while searching rentals"));
  }
};

// UPDATE RENTAL

const updateRental = async (req, res, next) => {
  const files = req.files || [];
  const uploadedImages = [];

  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      deleteTempFiles(files);

      return next(createHttpError(400, "Invalid rental ID"));
    }

    // Find rental
    const rental = await rentalModel.findById(id);

    if (!rental) {
      deleteTempFiles(files);

      return next(createHttpError(404, "Rental not found"));
    }

    // Check ownership
    if (rental.creator_id.toString() !== req.userId.toString()) {
      deleteTempFiles(files);

      return next(
        createHttpError(403, "You are not allowed to update this rental"),
      );
    }

    const {
      ownerName,
      contactNumber,
      propertyType,
      location,
      monthlyRent,
      areaSize,
      description,
      status,
    } = req.body;

    // Update fields if provided

    if (ownerName !== undefined) {
      rental.ownerName = ownerName.trim();
    }

    if (contactNumber !== undefined) {
      rental.contactNumber = contactNumber.trim();
    }

    if (propertyType !== undefined) {
      rental.propertyType = propertyType;
    }

    if (location !== undefined) {
      rental.location = location.trim();
    }

    if (monthlyRent !== undefined) {
      rental.monthlyRent = Number(monthlyRent);
    }

    if (areaSize !== undefined) {
      rental.areaSize = areaSize.trim();
    }

    if (description !== undefined) {
      rental.description = description.trim();
    }

    if (status !== undefined) {
      rental.status = status;
    }

    // ================================================
    // Replace images if new images are uploaded
    // ================================================

    if (files.length > 0) {
      if (files.length > 5) {
        deleteTempFiles(files);

        return next(createHttpError(400, "Maximum 6 images are allowed"));
      }

      // Upload new images
      const uploadedResults = await Promise.all(
        files.map((file) =>
          uploadAndCompressImage(file.path, "realestate/properties"),
        ),
      );

      uploadedImages.push(...uploadedResults);

      // Delete old Cloudinary images
      for (const oldImage of rental.images) {
        if (oldImage.public_id) {
          try {
            await cloudinary.uploader.destroy(oldImage.public_id);
          } catch (error) {
            console.error("Failed to delete old Cloudinary image:", error);
          }
        }
      }

      // Replace old images
      rental.images = uploadedImages;
    }

    await rental.save();

    // Delete temporary files
    deleteTempFiles(files);

    return res.status(200).json({
      message: "Rental updated successfully",
      rental,
    });
  } catch (error) {
    console.error("Update rental error:", error);

    // Delete newly uploaded Cloudinary images
    for (const image of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (deleteError) {
        console.error("Failed to delete uploaded image:", deleteError);
      }
    }

    // Delete temporary files
    deleteTempFiles(files);

    return next(createHttpError(500, "Error while updating rental"));
  }
};

// DELETE RENTAL

const deleteRental = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid rental ID"));
    }

    // Find rental
    const rental = await rentalModel.findById(id);

    if (!rental) {
      return next(createHttpError(404, "Rental not found"));
    }

    // Check ownership
    if (rental.creator_id.toString() !== req.userId.toString()) {
      return next(
        createHttpError(403, "You are not allowed to delete this rental"),
      );
    }

    // Delete Cloudinary images
    for (const image of rental.images) {
      if (image.public_id) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (error) {
          console.error("Failed to delete Cloudinary image:", error);
        }
      }
    }

    // Delete rental from MongoDB
    await rentalModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Rental and its images deleted successfully",
    });
  } catch (error) {
    console.error("Delete rental error:", error);

    return next(createHttpError(500, "Error while deleting rental"));
  }
};

// EXPORT

export {
  createRental,
  getAllRentals,
  getRental,
  searchRentals,
  updateRental,
  deleteRental,
};
