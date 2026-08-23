"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { propertyApi } from "@/lib/api/property";
import { rentalApi } from "@/lib/api/rental";
import PropertyCard from "@/components/properties/PropertyCard";
import RentalCard from "@/components/rentals/RentalCard";
import toast from "react-hot-toast";
import { Search as SearchIcon, Loader2, Building2 } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [properties, setProperties] = useState([]);
  const [rentals, setRentals] = useState([]);

  const debounceRef = useRef(null);

  const runSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearched(false);
      setProperties([]);
      setRentals([]);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      const [propertyData, rentalData] = await Promise.all([
        propertyApi.search(searchTerm),
        rentalApi.search(searchTerm),
      ]);

      const foundProperties = Array.isArray(propertyData)
        ? propertyData
        : propertyData?.properties ?? [];

      const foundRentals = Array.isArray(rentalData)
        ? rentalData
        : rentalData?.rentals ?? [];

      setProperties(foundProperties);
      setRentals(foundRentals);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runSearch(value);
    }, 400);
  };

  // Cleanup pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const totalResults = properties.length + rentals.length;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-2 text-sm font-semibold text-cyan-500">LANDLORD</p>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Search
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
            Search properties and rentals by location.
          </p>

          <div className="relative mt-6 max-w-xl">
            <SearchIcon
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by location..."
              value={query}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-11 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />

            {loading && (
              <Loader2
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-cyan-500"
              />
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!searched ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center text-gray-500">
            <SearchIcon size={32} className="mb-3 text-gray-300" />
            <p className="text-sm">Start typing a location to search.</p>
          </div>
        ) : loading && totalResults === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 size={32} className="animate-spin text-cyan-500" />
          </div>
        ) : totalResults === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-500">
              <Building2 size={26} />
            </div>
            <h2 className="text-lg font-semibold text-black">No results found</h2>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Try a different location.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">
              {totalResults} {totalResults === 1 ? "result" : "results"} found
            </p>

            {properties.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-lg font-bold text-black">
                  Properties ({properties.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
              </div>
            )}

            {rentals.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-black">
                  Rentals ({rentals.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rentals.map((rental) => (
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