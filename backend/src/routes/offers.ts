import { Router } from "express";
import { prisma } from "../lib/prisma";
import { auth } from "../middleware/auth";

const r = Router();

// Składanie oferty przez zalogowanego użytkownika
r.post("/", auth("USER"), async (req: any, res) => {
  const { carId, amount, message } = req.body;
  const offer = await prisma.offer.create({
    data: { carId: Number(carId), amount: Number(amount), message, userId: req.user!.id }
  });
  res.json(offer);
});

// Lista ofert (admin)
r.get("/", auth("ADMIN"), async (_req, res) => {
  const offers = await prisma.offer.findMany({ include: { car: true, user: true }, orderBy: { id: "desc" } });
  res.json(offers);
});

export default r;
