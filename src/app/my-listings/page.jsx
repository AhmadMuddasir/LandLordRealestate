"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { propertyApi } from "@/lib/api/property";
import { rentalApi } from "@/lib/api/rental";
import PropertyCard from "@/components/properties/PropertyCard";
import RentalCard from "@/components/rentals/RentalCard";
import { Loader2, PlusCircle } from "lucide-react";

export default function MyListingsPage() {
  const [myProperties, setMyProperties] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadMyListings();
  }, [user]);

  const loadMyListings = async () => {
    try {
      setLoading(true);

      const [propertyData, rentalData] = await Promise.all([
        propertyApi.getAll(),
        rentalApi.getAll(),
      ]);

      const allProperties = Array.isArray(propertyData)
        ? propertyData
        : propertyData?.properties ?? [];

      const allRentals = Array.isArray(rentalData)
        ? rentalData
        : rentalData?.rentals ?? [];

      const filteredProperties = allProperties.filter(
        (p) => String(p.creator_id) === String(user.id)
      );

      const filteredRentals = allRentals.filter(
        (r) => String(r.creator_id) === String(user.id)
      );

      setMyProperties(filteredProperties);
      setMyRentals(filteredRentals);
      setError(null);
    } catch (err) {
      console.error("Load error:", err);
      setError(err.message || "Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-white px-4 py-20 text-center">
        <p className="text-gray-500">Please log in to view your listings.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-cyan-500">
                LANDLORD
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                My Listings
              </h1>
            </div>

            <Link
              href="/add-listings"
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              <PlusCircle size={18} />
              Add Listing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 size={32} className="animate-spin text-cyan-500" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : myProperties.length === 0 && myRentals.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven't listed anything yet.
          </p>
        ) : (
          <>
            {myProperties.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-lg font-bold text-black">
                  Properties ({myProperties.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myProperties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                    />
                  ))}
                </div>
              </div>
            )}

            {myRentals.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-black">
                  Rentals ({myRentals.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myRentals.map((rental) => (
                    <RentalCard key={rental._id} rental={rental} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}