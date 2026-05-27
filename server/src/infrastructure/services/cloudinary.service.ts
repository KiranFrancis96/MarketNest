import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dprwskb7s",
  api_key: process.env.CLOUDINARY_API_KEY || "895178593458269",
  api_secret: process.env.CLOUDINARY_API_SECRET || "mufhtzxvttzrhe_whwhwhw"
});

export class CloudinaryService {
  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];

    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                          process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      try {
        const uploadPromises = files.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "marketnest/products" },
              (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result.secure_url);
                reject(new Error("Empty result"));
              }
            );
            uploadStream.end(file.buffer);
          });
        });
        return await Promise.all(uploadPromises);
      } catch (err) {
      }
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localUrls = files.map((file) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || ".jpg")}`;
      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, file.buffer);
      return `http://localhost:3000/uploads/${uniqueName}`;
    });

    return localUrls;
  }

  async deleteImage(url: string): Promise<void> {
    if (!url) return;

    if (url.startsWith("http://localhost:3000/uploads/")) {
      try {
        const filename = url.split("/").pop();
        if (filename) {
          const filePath = path.join(process.cwd(), "uploads", filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (err) {
      }
      return;
    }

    try {
      const parts = url.split("/");
      const filename = parts.pop();
      if (!filename) return;

      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex === -1) return;

      let publicIdParts = parts.slice(uploadIndex + 2);
      if (publicIdParts[0] && publicIdParts[0].startsWith("v")) {
        publicIdParts = publicIdParts.slice(1);
      }
      
      const publicId = [...publicIdParts, filename.split(".")[0]].join("/");
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
    }
  }
}

export const cloudinaryService = new CloudinaryService();
