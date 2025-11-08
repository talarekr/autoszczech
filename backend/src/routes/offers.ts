import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { auth, AuthReq } from "../middleware/auth.js";

const r = Router();

// Składanie oferty przez zalogowanego użytkownika
r.post("/", auth("USER"), async (req: AuthReq, res: Response) => {
  const { carId, amount, message } = (req.body || {}) as { carId: number; amount: number; message?: string };
  const offer = await prisma.offer.create({
    data: { carId: Number(carId), amount: Number(amount), message, userId: req.user!.id },
    include: { user: true },
  });
  res.json(offer);
});

// Lista ofert (admin)
r.get("/", auth("ADMIN"), async (_req: Request, res: Response) => {
  const offers = await prisma.offer.findMany({ include: { car: true, user: true }, orderBy: { createdAt: "desc" } });
  res.json(offers);
});

export default r;
