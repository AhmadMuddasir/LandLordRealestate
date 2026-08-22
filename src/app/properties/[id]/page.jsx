'use client';

import ImageCarousel from "@/components/ImageCarousel";
import { useAuth } from "@/context/AuthContext";
import { propertyApi } from "@/lib/api/property";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const page = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const params = useParams();
  const router = useRouter()
  const {user} = useAuth();

  useEffect(()=>{
    loadProperties();

  },[params.id]);

  const loadProperties = async () => {
    try {
      setLoading(true);

      const data = await propertyApi.getById(params.id);
      const list = data.property
      console.log("list:", list);
      console.log("data:", data.property);
      setProperties(list);
    } catch (error) {
      console.error("Failed to load properties:", error);
      toast.error(error.response?.data?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty =async()=>{
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }
    try {
      setDeleting(true);
      await propertyApi.delete(params.id);
      router.push("/")
    } catch (error) {
      console.log(error)
      setDeleting(false)
    }
  }
    const image =
    properties.images?.[0]?.url ||
    properties.images?.[0] ||
    "/placeholder-property.jpg";
 return (
  <>
    <main className="min-h-screen bg-white">
      {loading ? (
        /* Loading */
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500" />

            <p className="mt-4 text-sm text-gray-500">
              Loading property...
            </p>
          </div>
        </div>
      ) : !properties ? (
        /* Not Found */
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black">
              Property not found
            </h1>

            <p className="mt-2 text-gray-500">
              This property may have been removed.
            </p>

            <button
              onClick={() => router.push("/properties")}
              className="mt-6 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Back to Properties
            </button>
          </div>
        </div>
      ) : (
        /* Property Details */
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-6 text-sm font-medium text-gray-500 transition hover:text-cyan-500"
          >
            ← Back to properties
          </button>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Images */}
          <ImageCarousel images={properties.images} alt={properties.description} />


            {/* Details */}
            <div className="p-5 sm:p-8">

              {/* Status + Type */}
              <div className="flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
                  Property type: {properties.propertyType}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    properties.status === "Sold"
                      ? "bg-red-50 text-red-500"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  status: {properties.status}
                </span>

              </div>


              {/* Price */}
              <h1 className="mt-4 text-3xl font-bold text-black sm:text-4xl">
                price₹: {Number(properties.price).toLocaleString("en-IN")}
              </h1>


              {/* Location */}
              <p className="mt-3 flex items-start gap-2 text-gray-600">
                <span className="text-cyan-500">📍</span>
                <span> {properties.location}</span>
              </p>


              {/* Quick Info */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Property Type
                  </p>

                  <p className="mt-1 font-semibold text-black">
                    {properties.propertyType}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Area
                  </p>

                  <p className="mt-1 font-semibold text-black">
                    {properties.areaSize}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <p className="mt-1 font-semibold text-black">
                    {properties.status}
                  </p>
                </div>

              </div>


              {/* Description */}
              <div className="mt-8 border-t border-gray-100 pt-8">

                <h2 className="text-xl font-bold text-black">
                  Property Description
                </h2>

                <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                  {properties.description}
                </p>

              </div>


              {/* Owner */}
              <div className="mt-8 rounded-xl border border-gray-200 p-5">

                <h2 className="text-lg font-bold text-black">
                  Property Owner
                </h2>

                <div className="mt-4">

                  <p className="font-semibold text-black">
                    {properties.Ownername}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {properties.contactNumber}
                  </p>

                </div>

              </div>


              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                {/* Contact */}
                {properties.contactNumber && (
                  <a
                    href={`tel:${properties.contactNumber}`}
                    className="flex flex-1 items-center justify-center rounded-xl bg-cyan-500 px-5 py-3.5 font-semibold text-white transition hover:bg-cyan-600"
                  >
                    📞 Contact Owner
                  </a>
                )}


                {/* Delete - only owner */}
                {user &&
                  properties.creator_id &&
                  String(properties.creator_id) === String(user.id) && (
                    <button
                      onClick={deleteProperty}
                      disabled={deleting}
                      className="flex flex-1 items-center justify-center rounded-xl border border-red-200 px-5 py-3.5 font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete Property"}
                    </button>
                  )}

              </div>

            </div>

          </div>

        </section>
      )}
    </main>
  </>
);
}

export default page