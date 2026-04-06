import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import fs from "fs/promises";

const UPLOADS_DIR = path.resolve("uploads");

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `photo-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("نوع الملف غير مدعوم. الأنواع المقبولة: JPG, PNG, WEBP"));
    }
  },
});

const router: IRouter = Router();

router.post(
  "/photo/upload",
  requireAuth,
  upload.single("photo"),
  async (req: AuthRequest, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "لم يتم إرفاق صورة" });
      return;
    }
    const filename = req.file.filename;
    const previewUrl = `/api/uploads/${filename}`;
    res.json({ filename, previewUrl });
  }
);

export default router;
