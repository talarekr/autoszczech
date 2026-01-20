import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../lib/prisma.js";
import { auth, AuthReq } from "../middleware/auth.js";

const r = Router();

const resolveCarWhere = (carId?: string | number, displayId?: string | null): Prisma.CarWhereInput[] => {
  const parsedId = Number(carId);
  const trimmedDisplay = typeof displayId === "string" ? displayId.trim() : null;

  return [
    Number.isFinite(parsedId) && parsedId > 0 ? { id: parsedId } : undefined,
    trimmedDisplay
      ? {
          displayId: {
            equals: trimmedDisplay,
            mode: "insensitive",
          },
        }
      : undefined,
  ].filter(Boolean) as Prisma.CarWhereInput[];
};

r.get("/mine", auth("USER"), async (req: AuthReq, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
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

    res.json(favorites);
  } catch (error) {
    console.error("Nie udało się pobrać ulubionych", error);
    res.status(500).json({ error: "Nie udało się pobrać ulubionych" });
  }
});

r.post("/", auth("USER"), async (req: AuthReq, res: Response) => {
  const { carId, displayId } = (req.body || {}) as { carId?: number | string; displayId?: string | null };
  const carConditions = resolveCarWhere(carId, displayId);

  if (carConditions.length === 0) {
    return res.status(400).json({ error: "Niepoprawne dane ulubionych" });
  }

  try {
    const car = await prisma.car.findFirst({ where: { OR: carConditions } });
    if (!car) {
      return res.status(404).json({ error: "Oferta nie istnieje lub została usunięta" });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_carId: {
          userId: req.user!.id,
          carId: car.id,
        },
      },
      include: {
        car: {
          include: { images: true },
        },
      },
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const favorite = await prisma.favorite.create({
      data: { userId: req.user!.id, carId: car.id },
      include: {
        car: {
          include: { images: true },
        },
      },
    });

    res.json(favorite);
  } catch (error) {
    console.error("Nie udało się dodać do ulubionych", error);
    res.status(500).json({ error: "Nie udało się dodać do ulubionych" });
  }
});

r.delete("/:carId", auth("USER"), async (req: AuthReq, res: Response) => {
  const { carId } = req.params as { carId?: string };
  const { displayId } = req.query as { displayId?: string };
  const carConditions = resolveCarWhere(carId, displayId ?? null);

  if (carConditions.length === 0) {
    return res.status(400).json({ error: "Niepoprawne dane ulubionych" });
  }

  try {
    const car = await prisma.car.findFirst({ where: { OR: carConditions } });
    if (!car) {
      return res.status(404).json({ error: "Oferta nie istnieje lub została usunięta" });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_carId: {
          userId: req.user!.id,
          carId: car.id,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Oferta nie jest na liście ulubionych" });
    }

    await prisma.favorite.delete({ where: { id: existing.id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Nie udało się usunąć z ulubionych", error);
    res.status(500).json({ error: "Nie udało się usunąć z ulubionych" });
  }
});

export default r;
