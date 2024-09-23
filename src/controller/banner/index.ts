import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ErrorResponse, getCurrentTime, SuccessResponse } from "../../utils";
import dbConfig from "../../config/db";
import { ResultSetHeader } from "mysql2";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // use relative path to save files
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    // Save with the original name but ensure uniqueness by prepending timestamp
    const uniqueName = `${Date.now()}-cricexchange-cdn-${file.originalname.replace(
      /\s+/g,
      ""
    )}`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    // Only accept .jpg, .jpeg, .png files
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      return callback(new Error("Only images (.jpg, .jpeg, .png) are allowed"));
    }
    callback(null, true);
  },
});

const router = Router();

router.post(
  "/banner",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.send(ErrorResponse("No file uploaded", 400));
      }

      // Store the relative file path (relative to the project root)
      const relativeFilePath = path
        .join("uploads", req.file.filename)
        .replace(/\\/g, "/"); // Replace backslashes with forward slashes for consistent URL format

      //   const filePath = req.file.path.replace(/\\/g, "/"); // Ensure proper path format
      const sql = `INSERT INTO banner (name, img, date) VALUES (?, ?, ?)`;
      const values = [req.file.filename, relativeFilePath, getCurrentTime()];

      await dbConfig(sql, values);
      res.send(SuccessResponse("Banner uploaded successfully", 200));
    } catch (error) {
      console.error("Error uploading banner:", error);
      res.send(ErrorResponse("Failed to upload banner", 500));
    }
  }
);

router.get("/banner", async (req: Request, res: Response) => {
  try {
    const sql = `SELECT * FROM banner`;
    const data = await dbConfig(sql);
    res.send(SuccessResponse(data, 200));
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.send(ErrorResponse("Failed to fetch banners", 500));
  }
});

router.delete("/banner/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch the banner details (including the file name) from the DB
    const fetchSql = `SELECT img, name FROM banner WHERE id = ?`;
    const banner = (await dbConfig(fetchSql, [id])) as any;

    if (banner.length === 0) {
      return res.send(ErrorResponse("Banner not found", 404));
    }

    // Delete the banner from the database
    const deleteSql = `DELETE FROM banner WHERE id = ?`;
    const data = (await dbConfig(deleteSql, [id])) as ResultSetHeader;

    if (data.affectedRows === 0) {
      return res.send(ErrorResponse("Failed to delete banner", 500));
    }

    // Remove the image from the uploads directory
    const bannerImage = banner[0].name;
    fs.unlinkSync(path.join(uploadDir, bannerImage));

    res.send(SuccessResponse("Banner deleted successfully", 200));
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.send(ErrorResponse("Failed to delete banner", 500));
  }
});

export default router;
