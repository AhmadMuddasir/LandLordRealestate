import { v2 as cloudinary } from "cloudinary";
import { config } from "./config.js";

// cloudinary configuration 
cloudinary.config({
     cloud_name:config.cloudinaryCloudName,
     api_key:config.cloudinariApiKey,
     api_secret:config.cloudinaryApiSecret,
})

const uploadAndCompressImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "realestate/properties",
    quality: "auto",
    fetch_format: "auto",
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};


export {
  uploadAndCompressImage,
};

export default cloudinary;
