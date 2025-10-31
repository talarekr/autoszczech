import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Tworzenie lub aktualizacja konta administratora
  const adminEmail = process.env.ADMIN_EMAIL || "talarekr@gmail.com";
  const adminPass = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const hash = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hash, role: "ADMIN" },
    create: { email: adminEmail, password: hash, role: "ADMIN" },
  });

  // Przykładowe dane samochodów
  const cars = [
    {
      make: "Audi",
      model: "A4",
      year: 2015,
      mileage: 120000,
      price: 25000,
      description: "Bardzo zadbany egzemplarz, serwisowany, bezwypadkowy.",
      location: "Warszawa",
      auctionStart: new Date(Date.now() - 86400000), // wczoraj
      auctionEnd: new Date(Date.now() + 7 * 86400000), // za tydzień
      images: { create: [{ url: "https://picsum.photos/seed/audi/800/500" }] },
    },
    {
      make: "BMW",
      model: "320d",
      year: 2016,
      mileage: 90000,
      price: 32000,
      description: "Diesel, oszczędny, pełen pakiet M.",
      location: "Kraków",
      auctionStart: new Date(Date.now() - 86400000),
      auctionEnd: new Date(Date.now() + 5 * 86400000),
      images: { create: [{ url: "https://picsum.photos/seed/bmw/800/500" }] },
    },
    {
      make: "Citroën",
      model: "C4",
      year: 2008,
      mileage: 100100,
      price: 7000,
      description: "Stan dobry, kilka poprawek lakierniczych. Import Szwajcaria.",
      location: "Zürich",
      auctionStart: new Date(Date.now() - 86400000),
      auctionEnd: new Date(Date.now() + 3 * 86400000),
      images: { create: [{ url: "https://picsum.photos/seed/citroen/800/500" }] },
    },
  ];

  for (const car of cars) {
    await prisma.car.create({ data: car });
  }

  console.log("✅ Seed complete — dane startowe dodane do bazy.");
}

// Uruchomienie seeda
main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
