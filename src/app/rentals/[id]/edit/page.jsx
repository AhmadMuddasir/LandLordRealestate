"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { rentalApi } from "@/lib/api/rental";
import toast from "react-hot-toast";
import {
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

const RENTAL_TYPES = ["House", "Apartment", "Room", "Shop", "Office"];
const STATUS_OPTIONS = ["Available", "Rented"];
const MAX_IMAGES = 6;

const EditRentalPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    ownerName: "",
    contactNumber: "",
    propertyType: "",
    location: "",
    monthlyRent: "",
    areaSize: "",
    description: "",
    status: "Available",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  useEffect(() => {
    if (user === null) {
      toast.error("Please log in to edit a listing", { id: "auth-required-edit-rental" });
      router.push("/login");
      return;
    }

    if (user) {
      loadRental();
    }
  }, [user, params.id]);

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  const loadRental = async () => {
    try {
      setLoading(true);

      const data = await rentalApi.getById(params.id);
      const rental = data.rental;

      if (!rental) {
        setNotFound(true);
        return;
      }

      if (String(rental.creator_id) !== String(user.id)) {
        toast.error("You are not allowed to edit this rental");
        router.push(`/rentals/${params.id}`);
        return;
      }

      setForm({
        ownerName: rental.ownerName || "",
        contactNumber: rental.contactNumber || "",
        propertyType: rental.propertyType || "",
        location: rental.location || "",
        monthlyRent: rental.monthlyRent ?? "",
        areaSize: rental.areaSize || "",
        description: rental.description || "",
        status: rental.status || "Available",
      });
      setExistingImages(rental.images || []);
    } catch (error) {
      console.error("Failed to load rental:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesSelected = (fileList) => {
    const newFiles = Array.from(fileList);

    if (newImages.length + newFiles.length > MAX_IMAGES) {
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

    setNewImages((prev) => [...prev, ...validFiles]);
    setNewPreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) {
      handleFilesSelected(e.target.files);
    }
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validate = () => {
    if (!form.ownerName.trim()) return "Owner name is required";
    if (!form.contactNumber.trim()) return "Contact number is required";
    if (!form.propertyType) return "Please select a rental type";
    if (!form.location.trim()) return "Location is required";
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0)
      return "Please enter a valid monthly rent";
    if (!form.areaSize.trim()) return "Area size is required";
    if (!form.description.trim()) return "Description is required";
    if (existingImages.length === 0 && newImages.length === 0)
      return "Please upload at least one image";
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
      formData.append("ownerName", form.ownerName);
      formData.append("contactNumber", form.contactNumber);
      formData.append("propertyType", form.propertyType);
      formData.append("location", form.location);
      formData.append("monthlyRent", form.monthlyRent);
      formData.append("areaSize", form.areaSize);
      formData.append("description", form.description);
      formData.append("status", form.status);

      // Backend replaces ALL images if any new files are sent
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      await rentalApi.update(params.id, formData);
      toast.success("Rental updated successfully");
      router.push(`/rentals/${params.id}`);
    } catch (err) {
      console.error("Failed to update rental:", err);
      toast.error(err.response?.data?.message || "Failed to update rental");
    } finally {
      setSubmitting(false);
    }
  };

  if (user === null) {
    return null; // redirecting
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-cyan-500" />
            <p className="mt-4 text-sm text-gray-500">Loading rental...</p>
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-black">Rental not found</h1>
          <p className="mt-2 text-gray-500">This rental may have been removed.</p>
          <button
            onClick={() => router.push("/my-listings")}
            className="mt-6 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Back to My Listings
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-500">
            <HomeIcon size={16} />
            RENTAL
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Edit Rental
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Update the details of your rental listing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Owner Name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Contact number */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Contact Number
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Rental type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Rental Type
            </label>
            <select
              name="propertyType"
              value={form.propertyType}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">Select type</option>
              {RENTAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Monthly rent */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Monthly Rent
            </label>
            <div className="relative">
              <IndianRupee size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="monthlyRent"
                value={form.monthlyRent}
                onChange={handleChange}
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
              <Ruler size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="areaSize"
                value={form.areaSize}
                onChange={handleChange}
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
              <FileText size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Current images */}
          {existingImages.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-black">
                Current Images
              </label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {existingImages.map((img) => (
                  <div
                    key={img._id || img.public_id}
                    className="aspect-square overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img src={img.url} alt="Current" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Uploading new images below will replace all current images.
              </p>
            </div>
          )}

          {/* New images */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              {existingImages.length > 0 ? "Replace Images" : "Images"}{" "}
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
                <span className="font-semibold text-cyan-600">Click to upload</span> or drag and drop
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

            {newPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {newPreviews.map((src, index) => (
                  <div
                    key={src}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img src={src} alt={`New preview ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNewImage(index);
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
                 Saving...may take 15-20 sec
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </section>
    </main>
  );
};

export default EditRentalPage;