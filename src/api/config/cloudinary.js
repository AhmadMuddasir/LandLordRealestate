import { v2 as cloudinary } from "cloudinary";
import { config } from "./config.js";

// cloudinary configuration 
cloudinary.config({
     cloud_name:config.cloudinaryCloudName,
     api_key:config.cloudinariApiKey,
     api_secret:config.cloudinaryApiSecret,
})

const uploadAndCompressImage = async (
  filePath,
  folder = "realestate/properties"
) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,

    // CHANGE: Limit very large camera images
    transformation: [
      {
        width: 2000,
        height: 2000,
        crop: "limit",
        quality: "auto",
      },
    ],
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
