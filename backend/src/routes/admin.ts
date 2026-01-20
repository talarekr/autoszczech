import { Router, Request, Response } from "express";
import { Prisma, RegistrationStatus } from "@prisma/client";

import prisma from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";

const insurers = ["AXA", "ALLIANZ", "SCC", "BEST", "REST"] as const;

type Insurer = (typeof insurers)[number];

const normalizeProvider = (value: unknown): Insurer | undefined => {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  return insurers.find((item) => item === upper);
};

const r = Router();

r.get("/auctions", auth("ADMIN"), async (req: Request, res: Response) => {
  const provider = normalizeProvider(req.query.provider);

  const where: Prisma.CarWhereInput = {
    offers: { some: {} },
    adminDismissed: false,
  };

  if (provider) {
    where.provider = { equals: provider, mode: "insensitive" };
  }

  const [cars, latestOffers] = await Promise.all([
    prisma.car.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        offers: {
          include: { user: true },
          orderBy: { amount: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.offer.findMany({
      where: { car: { adminDismissed: false, offers: { some: {} } } },
      select: { createdAt: true, car: { select: { provider: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const latestOffersByProvider = latestOffers.reduce<Record<string, string>>((acc, offer) => {
    const providerKey = offer.car?.provider?.toUpperCase();
    if (!providerKey || acc[providerKey]) return acc;
    acc[providerKey] = offer.createdAt.toISOString();
    return acc;
  }, {});

  res.json({ insurers, latestOffersByProvider, cars });
});

r.patch("/auctions/:id/dismiss", auth("ADMIN"), async (req: Request, res: Response) => {
  const carId = Number(req.params.id);
  if (!Number.isFinite(carId)) return res.status(400).json({ error: "Nieprawidłowe ID aukcji" });

  try {
    await prisma.offer.updateMany({ where: { carId }, data: { isWinner: false, winnerStatus: null } });

    const car = await prisma.car.update({
      where: { id: carId },
      data: { adminDismissed: true },
      select: { id: true },
    });

    res.json(car);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Aukcja nie istnieje" });
    }

    console.error("Nie udało się oznaczyć aukcji jako nierozstrzygniętej", error);
    res.status(500).json({ error: "Nie udało się zaktualizować aukcji" });
  }
});

r.get("/users", auth("ADMIN"), async (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status =
    typeof req.query.status === "string" && req.query.status.toUpperCase() === RegistrationStatus.PENDING
      ? RegistrationStatus.PENDING
      : undefined;

  const where: Prisma.UserWhereInput = {};

  if (status) {
    where.registrationStatus = status;
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      registrationStatus: true,
      createdAt: true,
      registrationForm: true,
    },
  });

  res.json({ users });
});

r.patch("/users/:id/approve", auth("ADMIN"), async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (!Number.isFinite(userId)) return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { registrationStatus: RegistrationStatus.APPROVED, approvedAt: new Date() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        registrationStatus: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }

    console.error("Nie udało się zaakceptować użytkownika", error);
    res.status(500).json({ error: "Nie udało się zaakceptować użytkownika" });
  }
});

export default r;
