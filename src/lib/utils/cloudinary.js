export const getOptimizedCloudinaryUrl = (url, width = 800) => {
  if (!url) return "/placeholder-property.jpg";

  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  return url.replace(
    "/image/upload/",
    `/image/upload/w_${width},c_limit,q_auto,f_auto/`,
  );
};
