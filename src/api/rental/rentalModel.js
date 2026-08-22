import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      required: true,
      enum: ["House", "Apartment", "Room", "Shop", "Office"],
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    monthlyRent: {
      type: Number,
      required: true,
    },

    areaSize: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          public_id: {
            type: String,
            required: true,
          },
        },
      ],
      validate: {
        validator: (images) => images.length <= 6,
        message: "Maximum 6 images allowed",
      },
    },

    status: {
      type: String,
      enum: ["Available", "Rented"],
      default: "Available",
    },

    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Rental || mongoose.model("Rental", rentalSchema);
