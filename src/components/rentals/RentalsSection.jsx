"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rentalApi } from "@/lib/api/rental";
import RentalCard from "./RentalCard";
import toast from "react-hot-toast";
import { Loader2, Search, House, ArrowRight } from "lucide-react";

const RentalsSection = ({
  limit = null,
  showSearch = true,
  showViewAll = false,
}) => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);

      const data = await rentalApi.getAll({
        limit: limit || 24,
      });
      const list = Array.isArray(data) ? data : (data?.rentals ?? []);

      setRentals(list);
    } catch (error) {
      console.error("Failed to load rentals:", error);
      toast.error(error.response?.data?.message || "Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = rentals.filter((rental) =>
    rental.location?.toLowerCase().includes(search.toLowerCase()),
  );

  const displayedRentals = limit
    ? filteredRentals.slice(0, limit)
    : filteredRentals;

  return (
    <>
      {/* Header */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-cyan-500">
                LANDLORD
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                Rentals
              </h1>

              <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
                Explore rental properties available in different locations.
              </p>
            </div>

            {showViewAll && (
              <Link
                href="/rentals"
                className="flex shrink-0 items-center gap-1 text-sm font-semibold text-cyan-600 transition hover:text-cyan-700"
              >
                View all <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {/* Search */}
          {showSearch && (
            <div className="relative max-w-xl">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search by location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          )}
        </div>
      </section>

      {/* Rentals */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Result count */}
        {!loading && showSearch && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredRentals.length}{" "}
              {filteredRentals.length === 1 ? "rental" : "rentals"} found
            </p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 size={32} className="animate-spin text-cyan-500" />
              <p className="text-sm">Loading rentals...</p>
            </div>
          </div>
        ) : displayedRentals.length === 0 ? (
          /* Empty state */
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-500">
              <House size={26} />
            </div>

            <h2 className="text-lg font-semibold text-black">
              No rentals found
            </h2>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              Try searching for a different location.
            </p>
          </div>
        ) : (
          /* Rental grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedRentals.map((rental) => (
              <RentalCard key={rental._id || rental.id} rental={rental} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default RentalsSection;
