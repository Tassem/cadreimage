import { Router } from "express";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { join, extname } from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { randomBytes } from "crypto";

const router = Router();

const UPLOADS_DIR = join(process.cwd(), "uploads");

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// Simple multipart file upload handler without multer for ESM compat
router.post("/photo/upload", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Use multer dynamically
    const multer = (await import("multer")).default;

    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Invalid file type"));
        }
      },
    });

    await new Promise<void>((resolve, reject) => {
      upload.single("photo")(req as any, res as any, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    await ensureUploadsDir();
    const ext = extname(file.originalname) || ".png";
    const filename = `upload_${randomBytes(8).toString("hex")}${ext}`;
    const filePath = join(UPLOADS_DIR, filename);
    await writeFile(filePath, file.buffer);

    res.json({ filename, url: `/api/uploads/${filename}` });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Upload failed" });
  }
});

export default router;
