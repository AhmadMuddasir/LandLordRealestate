"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, User, PlusCircle,Building2,LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setMenuOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-lg font-bold text-white">
             <Building2/>
          </div>

          {/* <span className="text-xl font-bold tracking-tight text-black">
            Real<span className="text-cyan-500">Estate</span>
          </span> */}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-black transition hover:text-cyan-500"
          >
            Home
          </Link>

          <Link
            href="/properties"
            className="text-sm font-medium text-gray-700 transition hover:text-cyan-500"
          >
            Properties
          </Link>

          <Link
            href="/rentals"
            className="text-sm font-medium text-gray-700 transition hover:text-cyan-500"
          >
            Rentals
          </Link>

          <Link
            href="/my-listings"
            className="text-sm font-medium text-gray-700 transition hover:text-cyan-500"
          >
            My listings
          </Link>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Search */}
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-cyan-50 hover:text-cyan-500"
            aria-label="Search"
          >
            <Search size={20} />
          </Link>

          {!isLoading && (
            <>
              {user ? (
                /* Logged In */
                <div className="flex items-center gap-2">
                  {/* User Profile */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-cyan-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                      <User size={18} />
                    </div>

                    <span className="max-w-[120px] truncate text-sm font-semibold text-black">
                      {user.name}
                    </span>
                  </Link>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                /* Logged Out */
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
                  >
                    <User size={18} />
                    Login
                  </Link>
                </>
              )}

              {/* Add Listing */}
              <Link
                href="/add-listings"
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                <PlusCircle size={18} />
                Add Listing
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right Side */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Search OUTSIDE menu */}
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-cyan-50 hover:text-cyan-500"
            aria-label="Search"
          >
            <Search size={20} />
          </Link>

          {/* Menu */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-black transition hover:bg-gray-100"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            {/* Navigation Links */}
            <div className="flex flex-col">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 font-medium text-black hover:bg-cyan-50 hover:text-cyan-600"
              >
                Home
              </Link>

              <Link
                href="/properties"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
              >
                Properties
              </Link>

              <Link
                href="/rentals"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
              >
                Rentals
              </Link>

              <Link
                href="/my-listings"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
              >
                My listings
              </Link>
            </div>

            {/* Mobile Account */}
            {!isLoading && (
              <div className="mt-3 border-t border-gray-100 pt-4">
                {user ? (
                  <>
                    {/* Profile */}
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-cyan-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                        <User size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-black">
                          {user.name}
                        </p>

                        <p className="text-xs text-gray-500">View profile</p>
                      </div>
                    </Link>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <LogOut size={19} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Login */}
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <User size={19} />
                      Login
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Add Listing */}
            <Link
              href="/add-listings"
              onClick={() => setMenuOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-600"
            >
              <PlusCircle size={19} />
              Add Listing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
