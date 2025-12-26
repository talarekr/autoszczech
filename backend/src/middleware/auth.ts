import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../lib/jwt.js";
import { isAllowedAdminEmail } from "../lib/adminAccess.js";

export interface AuthReq extends Request {
  user?: { id: number; role: "ADMIN" | "USER"; email: string };
}

export function auth(requiredRole?: "ADMIN" | "USER") {
  return (req: AuthReq, res: Response, next: NextFunction) => {
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Bearer ")) return res.status(401).json({ error: "Brak tokenu" });

    try {
      const token = hdr.slice(7);
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const role: "ADMIN" | "USER" = payload.role === "ADMIN" || payload.role === "USER" ? payload.role : "USER";
      if (requiredRole) {
        if (requiredRole === "USER" && role !== "USER" && role !== "ADMIN") {
          return res.status(403).json({ error: "Brak uprawnień" });
        }
        if (requiredRole === "ADMIN" && (role !== "ADMIN" || !isAllowedAdminEmail(payload.email))) {
          return res.status(403).json({ error: "Brak uprawnień" });
        }
      }
      req.user = { id: payload.id, role, email: payload.email };
      next();
    } catch {
      return res.status(401).json({ error: "Nieprawidłowy token" });
    }
  };
}
