import { Request, Response, NextFunction } from "express";
import cloudinary from "./cloudinary";

export const uploadImageToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.image && typeof req.body.image === "string") {
      // If the image is a valid string, pass control to the next middleware
      return next();
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "uploads", // Optional: cloudinary folder name
          public_id: `image-${Date.now()}`,
          resource_type: "image",
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Optimization & transformation URLs
    const optimizedUrl = cloudinary.url((result as any).public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    const croppedUrl = cloudinary.url((result as any).public_id, {
      crop: "auto",
      gravity: "auto",
      width: 500,
      height: 500,
    });

    // Attach the URLs to the request object for further use
    req.body.cloudinaryResult = {
      secure_url: (result as any).secure_url,
      optimized_url: optimizedUrl,
      cropped_url: croppedUrl,
    };

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};
