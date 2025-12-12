import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../lib/prisma.js";
import { auth, AuthReq } from "../middleware/auth.js";

const r = Router();

// Składanie oferty przez zalogowanego użytkownika
r.post("/", auth("USER"), async (req: AuthReq, res: Response) => {
  const { carId, displayId, amount, message } = (req.body || {}) as {
    carId?: number | string;
    displayId?: string;
    amount?: number;
    message?: string;
  };
  const parsedCarId = Number(carId);
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Niepoprawne dane oferty" });
  }

  try {
    const resolvedDisplayId = (() => {
      if (typeof displayId === "string" && displayId.trim().length > 0) return displayId.trim();
      if (typeof carId === "string" && !Number.isFinite(parsedCarId) && carId.trim().length > 0) return carId.trim();
      return null;
    })();
    const carConditions = [
      Number.isFinite(parsedCarId) && parsedCarId > 0 ? { id: parsedCarId } : undefined,
      resolvedDisplayId
        ? {
            displayId: {
              equals: resolvedDisplayId,
              mode: "insensitive",
            },
          }
        : undefined,
    ].filter(Boolean) as Prisma.CarWhereInput[];

    if (carConditions.length === 0) {
      return res.status(400).json({ error: "Niepoprawne dane oferty" });
    }

    const car = await prisma.car.findFirst({ where: { OR: carConditions } });
    if (!car) {
      return res.status(404).json({ error: "Oferta nie istnieje lub została usunięta" });
    }

    if (car.auctionEnd && car.auctionEnd < new Date()) {
      return res.status(400).json({ error: "Aukcja jest już zakończona" });
    }

    const offer = await prisma.offer.create({
      data: { carId: car.id, amount: parsedAmount, message, userId: req.user!.id }
    });

    res.json(offer);
  } catch (error) {
    console.error("Nie udało się zapisać oferty", error);
    res.status(500).json({ error: "Nie udało się zapisać oferty" });
  }
});

// Lista ofert zalogowanego użytkownika
r.get("/mine", auth("USER"), async (req: AuthReq, res: Response) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { userId: req.user!.id },
      include: {
        car: {
          include: {
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(offers);
  } catch (error) {
    console.error("Nie udało się pobrać ofert użytkownika", error);
    res.status(500).json({ error: "Nie udało się pobrać ofert" });
  }
});

// Lista ofert (admin)
r.get("/", auth("ADMIN"), async (_req: Request, res: Response) => {
  const offers = await prisma.offer.findMany({ include: { car: true, user: true }, orderBy: { id: "desc" } });
  res.json(offers);
});

export default r;
