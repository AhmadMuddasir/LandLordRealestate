"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { propertyApi } from "@/lib/api/property";
import { rentalApi } from "@/lib/api/rental";
import toast from "react-hot-toast";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
  Home as HomeIcon,
  LogOut,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ properties: 0, rentals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      toast.error("Please log in to view your profile", { id: "auth-required-profile" });
      router.push("/login");
      return;
    }

    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
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

      const myProperties = allProperties.filter(
        (p) => String(p.creator_id) === String(user.id)
      );
      const myRentals = allRentals.filter(
        (r) => String(r.creator_id) === String(user.id)
      );

      setStats({
        properties: myProperties.length,
        rentals: myRentals.length,
      });
    } catch (error) {
      console.error("Failed to load profile stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout?.();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (user === null) {
    return null; // redirecting
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-cyan-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-2 text-sm font-semibold text-cyan-500">LANDLORD</p>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            My Profile
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Profile card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-2xl font-bold text-cyan-600">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-black">
                {user.name || "User"}
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
            {user.email && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-cyan-500" />
                {user.email}
              </div>
            )}

            {user.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-cyan-500" />
                {user.phone}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="mt-8 flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-500">
              <Building2 size={18} />
            </div>
            <p className="text-2xl font-bold text-black">
              {loading ? "-" : stats.properties}
            </p>
            <p className="text-sm text-gray-500">Properties Listed</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-500">
              <HomeIcon size={18} />
            </div>
            <p className="text-2xl font-bold text-black">
              {loading ? "-" : stats.rentals}
            </p>
            <p className="text-sm text-gray-500">Rentals Listed</p>
          </div>
        </div>
      </section>
    </main>
  );
}