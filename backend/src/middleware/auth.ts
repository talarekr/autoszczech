import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthReq extends Request { user?: { id: number; role: string; email: string } }

export function auth(requiredRole?: "ADMIN" | "USER") {
  return (req: AuthReq, res: Response, next: NextFunction) => {
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Bearer ")) return res.status(401).json({ error: "Brak tokenu" });
    try {
      const token = hdr.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET! ) as any;
      if (requiredRole && payload.role !== requiredRole) return res.status(403).json({ error: "Brak uprawnień" });
      req.user = { id: payload.id, role: payload.role, email: payload.email };
      next();
    } catch {
      return res.status(401).json({ error: "Nieprawidłowy token" });
    }
  }
}
