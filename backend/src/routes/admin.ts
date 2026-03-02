import { Router, Request, Response } from "express";
import { Prisma, RegistrationStatus } from "@prisma/client";

import prisma from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";
import { sendAccountApprovedEmail } from "../lib/mailer.js";

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
  const dateFrom = typeof req.query.dateFrom === "string" ? req.query.dateFrom.trim() : "";
  const dateTo = typeof req.query.dateTo === "string" ? req.query.dateTo.trim() : "";
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

  const createdAtFilter: Prisma.DateTimeFilter = {};

  if (dateFrom) {
    const parsedFrom = new Date(`${dateFrom}T00:00:00.000Z`);
    if (Number.isNaN(parsedFrom.getTime())) {
      return res.status(400).json({ error: "Nieprawidłowa data początkowa" });
    }
    createdAtFilter.gte = parsedFrom;
  }

  if (dateTo) {
    const parsedTo = new Date(`${dateTo}T23:59:59.999Z`);
    if (Number.isNaN(parsedTo.getTime())) {
      return res.status(400).json({ error: "Nieprawidłowa data końcowa" });
    }
    createdAtFilter.lte = parsedTo;
  }

  if (Object.keys(createdAtFilter).length > 0) {
    where.createdAt = createdAtFilter;
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

    void sendAccountApprovedEmail({
      to: user.email,
      firstName: user.firstName,
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


r.delete("/users/:id/reject", auth("ADMIN"), async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (!Number.isFinite(userId)) return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });

  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, registrationStatus: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }

    if (existing.registrationStatus !== RegistrationStatus.PENDING) {
      return res.status(400).json({ error: "Odrzucić można tylko oczekujące zgłoszenia" });
    }

    await prisma.user.delete({ where: { id: userId } });

    res.json({ id: userId, rejected: true });
  } catch (error) {
    console.error("Nie udało się odrzucić zgłoszenia użytkownika", error);
    res.status(500).json({ error: "Nie udało się odrzucić zgłoszenia użytkownika" });
  }
});

r.get("/won-auctions", auth("ADMIN"), async (_req: Request, res: Response) => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        offers: {
          some: {
            winnerStatus: "AWARDED",
          },
        },
      },
      include: {
        offers: {
          where: {
            winnerStatus: "AWARDED",
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const wonAuctions = cars
      .map((car) => {
        const winnerOffer = car.offers.find((offer) => offer.winnerStatus === "AWARDED") ?? null;
        if (!winnerOffer) return null;

        return {
          id: car.id,
          displayId: car.displayId,
          make: car.make,
          model: car.model,
          provider: car.provider,
          auctionEnd: car.auctionEnd,
          winnerOffer: {
            id: winnerOffer.id,
            amount: winnerOffer.amount,
            createdAt: winnerOffer.createdAt,
            userId: winnerOffer.userId,
            user: winnerOffer.user,
          },
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    res.json({ wonAuctions });
  } catch (error) {
    console.error("Nie udało się pobrać aukcji wygranych", error);
    res.status(500).json({ error: "Nie udało się pobrać aukcji wygranych" });
  }
});

export default r;
