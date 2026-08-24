"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Tag,
} from "lucide-react";
import { getOptimizedCloudinaryUrl } from "@/lib/utils/cloudinary";

const RentalCard = ({ rental }) => {
 const image = getOptimizedCloudinaryUrl(
  rental.images?.[0]?.url,
  800
);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Image */}
      <Link
        href={`/rentals/${rental._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-gray-100"
      >
        <Image
          src={image}
          alt={rental.description || "Rental property"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Status */}
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-cyan-600 shadow-sm">
          {rental.status || "Available"}
        </div>
      </Link>


      {/* Content */}
      <div className="p-4">

        {/* Rental Type */}
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-cyan-600">
          <Tag size={14} />
          {rental.propertyType || "Rental"}
        </div>


        {/* Price */}
        <h2 className="text-xl font-bold text-black">
          ₹{Number(rental.monthlyRent || 0).toLocaleString("en-IN")}
          <span className="ml-1 text-sm font-medium text-gray-500">
            / month
          </span>
        </h2>


        {/* Location */}
        <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">

          <MapPin
            size={17}
            className="mt-0.5 shrink-0 text-cyan-500"
          />

          <span className="line-clamp-2">
            {rental.location}
          </span>

        </div>


        {/* Description */}
        {rental.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
            {rental.description}
          </p>
        )}


        {/* Footer */}
        <div className="mt-5 border-t border-gray-100 pt-4">

          <Link
            href={`/rentals/${rental._id}`}
            className="flex items-center justify-between text-sm font-semibold text-cyan-600 transition hover:text-cyan-700"
          >

            <span>View rental</span>

            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />

          </Link>

        </div>

      </div>

    </article>
  );
};

export default RentalCard;