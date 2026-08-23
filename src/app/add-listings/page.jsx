"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { propertyApi } from "@/lib/api/property";
import { rentalApi } from "@/lib/api/rental";
import toast from "react-hot-toast";
import {
  Building2,
  Home as HomeIcon,
  Upload,
  X,
  Loader2,
  User,
  Phone,
  MapPin,
  Ruler,
  FileText,
  IndianRupee,
} from "lucide-react";

const PROPERTY_TYPES = ["Land", "Plot", "Commercial Store"];
const RENTAL_TYPES = ["House", "Apartment", "Room", "Shop", "Office"];

const MAX_IMAGES = 6;

const AddListingPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [listingType, setListingType] = useState("property"); // "property" | "rental"
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    ownerName: "",
    contactNumber: "",
    propertyType: "",
    location: "",
    price: "", // used as price (property) or monthlyRent (rental)
    areaSize: "",
    description: "",
  });

  const [images, setImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // object URLs

  // Redirect if not logged in
useEffect(() => {
  if (user === null) {
    toast.error("Please log in to add a listing", { id: "auth-required" });
    router.push("/login");
  }
}, [user, router]);

  // Reset propertyType when switching listing type (different enums)
  useEffect(() => {
    setForm((prev) => ({ ...prev, propertyType: "" }));
  }, [listingType]);

  // Cleanup object URLs on unmount / when images change
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const typeOptions =
    listingType === "property" ? PROPERTY_TYPES : RENTAL_TYPES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesSelected = (fileList) => {
    const newFiles = Array.from(fileList);

    if (images.length + newFiles.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) {
      handleFilesSelected(e.target.files);
    }
    e.target.value = ""; // allow re-selecting the same file
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validate = () => {
    if (!form.ownerName.trim()) return "Owner name is required";
    if (!form.contactNumber.trim()) return "Contact number is required";
    if (!form.propertyType) return "Please select a property type";
    if (!form.location.trim()) return "Location is required";
    if (!form.price || Number(form.price) <= 0)
      return listingType === "property"
        ? "Please enter a valid price"
        : "Please enter a valid monthly rent";
    if (!form.areaSize.trim()) return "Area size is required";
    if (!form.description.trim()) return "Description is required";
    if (images.length === 0) return "Please upload at least one image";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      if (listingType === "property") {
        formData.append("ownerName", form.ownerName);
        formData.append("contactNumber", form.contactNumber);
        formData.append("propertyType", form.propertyType);
        formData.append("location", form.location);
        formData.append("price", form.price);
        formData.append("areaSize", form.areaSize);
        formData.append("description", form.description);
      } else {
        formData.append("ownerName", form.ownerName);
        formData.append("contactNumber", form.contactNumber);
        formData.append("propertyType", form.propertyType);
        formData.append("location", form.location);
        formData.append("monthlyRent", form.price);
        formData.append("areaSize", form.areaSize);
        formData.append("description", form.description);
      }

      images.forEach((file) => {
        formData.append("images", file);
      });

      if (listingType === "property") {
        await propertyApi.create(formData);
        toast.success("Property listed successfully");
      } else {
        await rentalApi.create(formData);
        toast.success("Rental listed successfully");
      }

      router.push("/my-listings");
    } catch (err) {
      console.error("Failed to create listing:", err);
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (user === null) {
    return null; // redirecting
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-2 text-sm font-semibold text-cyan-500">LANDLORD</p>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Add Listing
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            List a property for sale or a rental in a few steps.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Listing type toggle */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setListingType("property")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
              listingType === "property"
                ? "border-cyan-500 bg-cyan-50 text-cyan-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <Building2 size={18} />
            Property for Sale
          </button>

          <button
            type="button"
            onClick={() => setListingType("rental")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
              listingType === "rental"
                ? "border-cyan-500 bg-cyan-50 text-cyan-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <HomeIcon size={18} />
            Rental
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Owner Name
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="e.g. Ahmad"
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Contact number */}
          <div>
            <label className="mb-1.5 block text-xl font-bold text-black">
              Whatsapp Number
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Property type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              {listingType === "property" ? "Property Type" : "Rental Type"}
            </label>
            <select
              name="propertyType"
              value={form.propertyType}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">Select type</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Location
            </label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Guwahati, Assam"
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Price / Monthly rent */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              {listingType === "property" ? "Price" : "Monthly Rent"}
            </label>
            <div className="relative">
              <IndianRupee
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder={
                  listingType === "property" ? "e.g. 500000" : "e.g. 12000"
                }
                min="0"
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Area size */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Area Size
            </label>
            <div className="relative">
              <Ruler
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="areaSize"
                value={form.areaSize}
                onChange={handleChange}
                placeholder="e.g. 1200 sqft or 2 bigha"
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Description
            </label>
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-3.5 top-3.5 text-gray-400"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the property..."
                className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Images{" "}
              <span className="font-normal text-gray-400">
                (up to {MAX_IMAGES}, max 5MB each)
              </span>
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center transition hover:border-cyan-300 hover:bg-cyan-50/40"
            >
              <Upload size={24} className="mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-cyan-600">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 5MB</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {previews.map((src, index) => (
                  <div
                    key={src}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              `List ${listingType === "property" ? "Property" : "Rental"}`
            )}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AddListingPage;
