import { type Response, type NextFunction } from "express";
import { requireAuth, type AuthRequest } from "./auth";

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: "صلاحيات غير كافية: للمسؤولين فقط" });
      return;
    }
    next();
  });
}
