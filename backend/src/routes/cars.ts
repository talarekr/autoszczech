import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";

const r = Router();

r.get("/", async (_req: Request, res: Response) => {
  const cars = await prisma.car.findMany({ include: { images: true }, orderBy: { id: "desc" } });
  res.json(cars);
});

r.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const car = await prisma.car.findUnique({ where: { id }, include: { images: true, offers: true } });
  if (!car) return res.status(404).json({ error: "Nie znaleziono" });
  res.json(car);
});

r.post("/", auth("ADMIN"), async (req: Request, res: Response) => {
  const { make, model, year, mileage, price, location, description, auctionStart, auctionEnd, images } = req.body || {};
  const car = await prisma.car.create({
    data: {
      make, model, year, mileage, price, location, description,
      auctionStart: auctionStart ? new Date(auctionStart) : null,
      auctionEnd: auctionEnd ? new Date(auctionEnd) : null,
      images: { create: (images || []).map((url: string) => ({ url })) }
    },
    include: { images: true }
  });
  res.json(car);
});

r.put("/:id", auth("ADMIN"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { make, model, year, mileage, price, location, description, auctionStart, auctionEnd } = req.body || {};
  const car = await prisma.car.update({
    where: { id },
    data: {
      make, model, year, mileage, price, location, description,
      auctionStart: auctionStart ? new Date(auctionStart) : null,
      auctionEnd: auctionEnd ? new Date(auctionEnd) : null
    }
  });
  res.json(car);
});

r.delete("/:id", auth("ADMIN"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.car.delete({ where: { id } });
  res.json({ ok: true });
});

export default r;
