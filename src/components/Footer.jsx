import Link from "next/link";
import { Building2, Home as HomeIcon, PlusCircle, User } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold text-black">LANDLORD</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Find properties and rentals across your city, all in one place.
            </p>
          </div>

          {/* Quick links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <Link href="/properties" className="flex items-center gap-1.5 transition hover:text-cyan-600">
              <Building2 size={15} />
              Properties
            </Link>
            <Link href="/rentals" className="flex items-center gap-1.5 transition hover:text-cyan-600">
              <HomeIcon size={15} />
              Rentals
            </Link>
            <Link href="/add-listings" className="flex items-center gap-1.5 transition hover:text-cyan-600">
              <PlusCircle size={15} />
              Add Listing
            </Link>
            <Link href="/profile" className="flex items-center gap-1.5 transition hover:text-cyan-600">
              <User size={15} />
              Profile
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gray-200 pt-6 text-xs text-gray-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Landlord. All rights reserved.</p>
          <p>Designed by Ahmad Muddasir</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;