"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { propertyApi } from "@/lib/api/property";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Phone,
  User,
  Ruler,
  IndianRupee,
  CalendarDays,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = params?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!id) return;

    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);

      const data = await propertyApi.getById(id);

      const propertyData = data?.property || data;

      setProperty(propertyData);
    } catch (error) {
      console.error("Failed to load property:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load property"
      );
    } finally {
      setLoading(false);
    }
  };

  const isOwner = () => {
    if (!user || !property) return false;

    const creatorId =
      property.creator_id?._id ||
      property.creator_id;

    return String(creatorId) === String(user.id);
  };

  const handleDelete = async () => {
    if (!property?._id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await propertyApi.delete(property._id);

      toast.success("Property deleted successfully");

      router.push("/my-listings");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete property"
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Price not available";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getImages = () => {
    if (!property?.images) return [];

    return property.images
      .map((image) => {
        if (typeof image === "string") return image;

        return image?.url || image?.secure_url;
      })
      .filter(Boolean);
  };

  const images = getImages();

  const openNextImage = () => {
    if (!images.length || selectedImage === null) return;

    const currentIndex = images.indexOf(selectedImage);

    const nextIndex =
      currentIndex === images.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedImage(images[nextIndex]);
  };

  const openPreviousImage = () => {
    if (!images.length || selectedImage === null) return;

    const currentIndex = images.indexOf(selectedImage);

    const previousIndex =
      currentIndex === 0
        ? images.length - 1
        : currentIndex - 1;

    setSelectedImage(images[previousIndex]);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <Loader2
          size={36}
          className="animate-spin text-cyan-500"
        />
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-white px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-black">
            Property not found
          </h1>

          <p className="mt-2 text-gray-500">
            This property may have been deleted or does not exist.
          </p>

          <Link
            href="/properties"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            <ArrowLeft size={18} />
            Back to Properties
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-cyan-500"
          >
            <ArrowLeft size={18} />
            Back to Properties
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Images */}
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Main image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 lg:col-span-3 lg:aspect-[16/9]">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={property.propertyType || "Property"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Small images */}
          <div className="hidden gap-4 lg:grid">
            {images.slice(1, 4).map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                className="relative overflow-hidden rounded-xl bg-gray-100"
              >
                <img
                  src={image}
                  alt={`Property image ${index + 2}`}
                  className="h-full w-full object-cover transition hover:scale-105"
                />
              </button>
            ))}

            {images.length === 1 && (
              <div className="rounded-xl bg-gray-50" />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Details */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
                  {property.status || "Available"}
                </span>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
                  {property.propertyType}
                </h1>

                <div className="mt-2 flex items-center gap-2 text-gray-500">
                  <MapPin size={18} />
                  <span>{property.location}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-600">
                  {formatPrice(property.price)}
                </p>
              </div>
            </div>

            {/* Property information */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2">
                    <Ruler
                      size={20}
                      className="text-cyan-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Area Size
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {property.areaSize}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2">
                    <CalendarDays
                      size={20}
                      className="text-cyan-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Listed On
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {formatDate(
                        property.createdAt ||
                          property.created_at
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-black">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                {property.description ||
                  "No description available."}
              </p>
            </div>

            {/* All images */}
            {images.length > 1 && (
              <div className="mt-10">
                <h2 className="mb-4 text-xl font-bold text-black">
                  Property Images
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(image)
                      }
                      className="aspect-square overflow-hidden rounded-xl bg-gray-100"
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-6 rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <h2 className="text-lg font-bold text-black">
                Contact Owner
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2">
                    <User
                      size={19}
                      className="text-cyan-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Owner
                    </p>

                    <p className="font-semibold text-black">
                      {property.ownerName ||
                        property.Ownername ||
                        "Owner"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2">
                    <Phone
                      size={19}
                      className="text-cyan-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Contact
                    </p>

                    <p className="font-semibold text-black">
                      {property.contactNumber ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              {property.contactNumber && (
                <a
                  href={`https://wa.me/91${String(
                    property.contactNumber
                  ).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
                >
                  Contact on WhatsApp
                </a>
              )}

              {/* Owner controls */}
              {isOwner() && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Manage Listing
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/properties/${property._id}/edit`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-100"
                    >
                      <Edit size={17} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}

                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X size={24} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPreviousImage();
            }}
            className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <ChevronLeft size={28} />
          </button>

          <img
            src={selectedImage}
            alt="Property"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openNextImage();
            }}
            className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </main>
  );
}