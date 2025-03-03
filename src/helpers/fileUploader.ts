import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../errors/ApiErrors";

// const multerUpload = multer({
//   storage: multer.memoryStorage(), // Store file in memory (buffer)
//   limits: {
//     fileSize: 50 * 1024 * 1024, // Optional: limit file size (50MB in this example)
//   },
// });

// export { multerUpload };

// Ensure the uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the destination folder
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Customize the filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

// Configure multer with storage and file filter
const multerUpload = multer({
  storage: storage, // Pass the configured storage
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
    }
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB file size limit
  },
});

export { multerUpload };
