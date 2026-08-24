"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Ruler,
  ArrowRight,
  Tag,
} from "lucide-react";
import { getOptimizedCloudinaryUrl } from "@/lib/utils/cloudinary";

const PropertyCard = ({ property }) => {
const image = getOptimizedCloudinaryUrl(
  property.images?.[0]?.url ||
    property.images?.[0],
  800
);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Image */}
      <Link
        href={`/properties/${property._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-gray-100"
      >

        <Image
          src={image}
          alt={property.description || "Property"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Status */}
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-cyan-600 shadow-sm">
          status: {property.status || "Available"}
        </div>

      </Link>


      {/* Content */}
      <div className="p-4">

        {/* Property type */}
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-cyan-600">
          <Tag size={14} />
          property Type: {property.propertyType}
        </div>


        {/* Price */}
        <h2 className="text-xl font-bold text-black">
          Price ₹{Number(property.price || 0).toLocaleString("en-IN")}
        </h2>


        {/* Location */}
        <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">

          <MapPin
            size={17}
            className="mt-0.5 shrink-0 text-cyan-500"
          />

          <span className="line-clamp-2">
            location {property.location}
          </span>

        </div>


        {/* Area */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">

          <Ruler
            size={17}
            className="text-gray-400"
          />

          <span>
            Area {property.areaSize}
          </span>

        </div>


        {/* Footer */}
        <div className="mt-5 border-t border-gray-100 pt-4">

          <Link
            href={`/properties/${property._id}`}
            className="flex items-center justify-between text-sm font-semibold text-cyan-600 transition hover:text-cyan-700"
          >

            <span>View property</span>

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

export default PropertyCard;