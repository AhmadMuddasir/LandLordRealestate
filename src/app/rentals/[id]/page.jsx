"use client";

import ImageCarousel from "@/components/ImageCarousel";
import { useAuth } from "@/context/AuthContext";
import { rentalApi } from "@/lib/api/rental";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil,Trash2 } from "lucide-react";

const page = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadRental();
  }, [params.id]);

  const loadRental = async () => {
    try {
      setLoading(true);

      const data = await rentalApi.getById(params.id);

      const list = data.rental;

      console.log("list:", list);
      console.log("data:", data.rental);

      setRentals(list);
    } catch (error) {
      console.error("Failed to load rental:", error);

      toast.error(error.response?.data?.message || "Failed to load rental");
    } finally {
      setLoading(false);
    }
  };

  const deleteRental = async () => {
    if (!window.confirm("Are you sure you want to delete this rental?")) {
      return;
    }

    try {
      setDeleting(true);

      await rentalApi.delete(params.id);

      toast.success("Rental deleted successfully");

      router.push("/rentals");
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to delete rental");

      setDeleting(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        {loading ? (
          /* Loading */
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500" />

              <p className="mt-4 text-sm text-gray-500">Loading rental...</p>
            </div>
          </div>
        ) : !rentals ? (
          /* Not Found */
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-black">
                Rental not found
              </h1>

              <p className="mt-2 text-gray-500">
                This rental may have been removed.
              </p>

              <button
                onClick={() => router.push("/rentals")}
                className="mt-6 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                Back to Rentals
              </button>
            </div>
          </div>
        ) : (
          /* Rental Details */
          <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="mb-6 text-sm font-medium text-gray-500 transition hover:text-cyan-500"
            >
              ← Back to rentals
            </button>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Images */}
              <ImageCarousel
                images={rentals.images}
                alt={rentals.description}
              />

              {/* Details */}
              <div className="p-5 sm:p-8">
                {/* Status + Type */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
                    Rental
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      rentals.status === "Rented"
                        ? "bg-red-50 text-red-500"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    status: {rentals.status}
                  </span>
                </div>

                {/* Price */}
                <h1 className="mt-4 text-3xl font-bold text-black sm:text-2xl">
                  Rent ₹: {Number(rentals.monthlyRent).toLocaleString("en-IN")}
                  <span className="ml-2 text-base font-medium text-gray-500">
                    / month
                  </span>
                </h1>

                {/* Location */}
                <p className="mt-3 flex items-start gap-2 text-gray-600">
                  <span className="text-cyan-500">📍</span>

                  <span>{rentals.location}</span>
                </p>

                {/* Quick Info */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Rental Type</p>

                    <p className="mt-1 font-semibold text-black">
                      {rentals.propertyType || "Rental"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Rent</p>

                    <p className="mt-1 font-semibold text-black">
                      ₹{Number(rentals.monthlyRent).toLocaleString("en-IN")}/
                      month
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Status</p>

                    <p className="mt-1 font-semibold text-black">
                      {rentals.status}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <h2 className="text-xl font-bold text-black">
                    Rental Description
                  </h2>

                  <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                    {rentals.description}
                  </p>
                </div>

                {/* Owner */}
                <div className="mt-8 rounded-xl border border-gray-200 p-5">

                  <div className="mt-4">
                    <p className="font-semibold text-black">
                      Property Owner: {rentals.ownerName}
                    </p>

                    <p className="mt-3 text-xl font-bold ">
                      Whatsapp: {rentals.contactNumber}
                    </p>
                  </div>
                </div>

                {/* Actions */}
<div className="mt-8 flex flex-col gap-3 sm:flex-row">
  {/* Edit - only owner */}
  {user &&
    rentals.creator_id &&
    String(rentals.creator_id) === String(user.id) && (
      <>
        <button
          onClick={() => router.push(`/rentals/${params.id}/edit`)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 font-semibold text-white transition hover:bg-cyan-600"
        >
          <Pencil size={17} />
          Edit Rentals
        </button>

        <button
          onClick={deleteRental}
          disabled={deleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3.5 font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={17} />
          {deleting ? "Deleting..." : "Delete Property"}
        </button>
      </>
    )}
</div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default page;
