import { v2 as cloudinary } from "cloudinary";
import Logger from "../../config/logger/logger.config.js";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUD_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUD_API_SECRET;


if (!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)) {
      throw new Error("❌ Cloudinary configuration is missing");
}

cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
});

const fileToBuffer = async (file) => {
      if (!file) return null;

      if (file.buffer) return file.buffer;

      if (file.arrayBuffer) {
            const arrayBuffer = await file.arrayBuffer();
            return Buffer.from(arrayBuffer);
      }

      return null;
};

export const uploadToCloudinary = async (file, options = {}) => {
      try {
            Logger.info('Starting Cloudinary upload', { folder: options.folder || "portfolio" });
            const buffer = await fileToBuffer(file);
            if (!buffer) {
                  Logger.error('Cloudinary upload failed - invalid file format');
                  throw new Error("Invalid file format");
            }

            const result = await new Promise((resolve, reject) => {
                  const uploadOptions = {
                        resource_type: "auto",
                        folder: options.folder || "portfolio",
                        public_id: options.public_id,
                        overwrite: options.overwrite ?? false,
                        ...options,
                  };

                  const uploadStream = cloudinary.uploader.upload_stream(
                        uploadOptions,
                        (error, result) => {
                              if (error) {
                                    Logger.error('Cloudinary upload stream error', { error: error.message });
                                    return reject(error);
                              }
                              Logger.info('Cloudinary upload successful', { 
                                    public_id: result.public_id, 
                                    secure_url: result.secure_url 
                              });
                              resolve(result);
                        }
                  );

                  uploadStream.end(buffer);
            });
            
            return result;
      } catch (error) {
            Logger.error('Cloudinary upload failed', { error: error.message });
            throw new Error(`Cloudinary upload failed: ${error.message}`);
      }
};

export const deleteFromCloudinary = async (
      publicId,
      resourceType = "image"
) => {
      try {
            Logger.info('Deleting from Cloudinary', { publicId, resourceType });
            const result = await cloudinary.uploader.destroy(publicId, {
                  resource_type: resourceType,
            });
            Logger.info('Cloudinary deletion successful', { publicId, result: result.result });
            return result;
      } catch (error) {
            Logger.error('Cloudinary deletion failed', { publicId, error: error.message });
            throw new Error(`Cloudinary deletion failed: ${error.message}`);
      }
};