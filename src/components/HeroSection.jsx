"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, PlusCircle, Home, MapPin, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    badge: "For Landlords & Owners",
    title: "Add & List Your Property Easily",
    description: "Reach thousands of verified buyers and tenants. Post your land, commercial store, or plot in minutes.",
    ctaText: "List Your Property",
    ctaLink: "/add-listings",
    icon: PlusCircle,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1920&auto=format&fit=crop",
    showSearch: false,
  },
  {
    id: 2,
    badge: "For Tenants & Renters",
    title: "Find Your Ideal Rental Space",
    description: "Explore houses, commercial shops, and apartments for rent directly from owners without middleman hassle.",
    ctaText: "Browse Rentals",
    ctaLink: "/rentals",
    icon: Home,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1920&auto=format&fit=crop",
    showSearch: false,
  },
  {
    id: 3,
    badge: "Buy & Invest",
    title: "Search & Buy Properties or Rentals",
    description: "Discover top-rated lands, commercial stores, and plots across your favorite prime locations.",
    ctaText: "Explore Properties",
    ctaLink: "/properties",
    icon: MapPin,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop",
    showSearch: true,
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full max-w-full overflow-hidden bg-gray-900 text-white">
      {/* Slider Track */}
      <div
        className="flex w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => {
          const IconComponent = slide.icon;
          return (
            <div
              key={slide.id}
              className="relative flex min-h-[480px] w-full max-w-full shrink-0 overflow-hidden items-center justify-center px-4 sm:min-h-[580px] sm:px-8 lg:min-h-[640px]"
            >
              {/* Background Image bounded strictly inside overflow-hidden */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />

              {/* Dark Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />

              {/* Content Box */}
              <div className="relative z-10 mx-auto w-full max-w-3xl py-12 text-center sm:py-16">
                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/20 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md sm:px-4 sm:py-1.5 sm:text-sm">
                  <IconComponent size={15} />
                  {slide.badge}
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl">
                  {slide.title}
                </h1>

                {/* Description */}
                <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-gray-200 sm:mt-4 sm:text-base">
                  {slide.description}
                </p>

                {/* Search Box on Slide 3 */}
                {slide.showSearch ? (
                  <div className="mx-auto mt-6 w-full max-w-lg sm:mt-8">
                    <form
                      action="/properties"
                      className="flex flex-col gap-2 rounded-xl bg-white/95 p-2 shadow-xl backdrop-blur-md sm:flex-row sm:rounded-xl"
                    >
                      <div className="flex flex-1 items-center gap-2 px-3 py-2 text-gray-800">
                        <MapPin size={18} className="shrink-0 text-cyan-500" />
                        <input
                          type="text"
                          name="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search location or title..."
                          className="w-full bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-600 sm:text-sm"
                      >
                        <Search size={16} />
                        Search
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Action Button for Slides 1 & 2 */
                  <div className="mt-6 sm:mt-8">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-semibold text-white shadow-lg transition hover:bg-cyan-600 sm:px-8 sm:py-4 sm:text-sm"
                    >
                      {slide.ctaText}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile-Safe Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/70 sm:left-4 sm:p-3"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={20} className="sm:hidden" />
        <ChevronLeft size={24} className="hidden sm:block" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/70 sm:right-4 sm:p-3"
        aria-label="Next Slide"
      >
        <ChevronRight size={20} className="sm:hidden" />
        <ChevronRight size={24} className="hidden sm:block" />
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-6 sm:gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "w-6 bg-cyan-400 sm:w-8"
                : "w-2 bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;