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

  // Wyczyść istniejące dane — UWAGA: najpierw tabele zależne (FK), potem Car
  await prisma.$transaction([
    prisma.offer.deleteMany(),
    prisma.favorite.deleteMany(), // <- musi być przed car.deleteMany()
    prisma.carImage.deleteMany(),
    prisma.car.deleteMany(),
    prisma.importJob.deleteMany(),
  ]);

  // Przykładowe dane samochodów — pozostawiamy tylko dwie aukcje startowe
  const cars = [
    {
      displayId: "SEED-AUDI-A4",
      make: "Audi",
      model: "A4",
      year: 2018,
      mileage: 89000,
      price: 25500,
      description:
        "Bardzo zadbany egzemplarz z pełną historią serwisową. Import ze Szwajcarii.",
      location: "Warszawa",
      auctionStart: new Date(Date.now() - 86400000), // wczoraj
      auctionEnd: new Date(Date.now() + 7 * 86400000), // za tydzień
      fuelType: "Diesel",
      transmission: "Automatyczna",
      provider: "Seed",
      source: "API",
      images: {
        create: [
          {
            url: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&h=600",
            order: 0,
          },
        ],
      },
    },
    {
      displayId: "SEED-BMW-320D",
      make: "BMW",
      model: "320d",
      year: 2019,
      mileage: 74000,
      price: 31800,
      description: "Sportowa wersja z pakietem M, po przeglądzie w ASO.",
      location: "Kraków",
      auctionStart: new Date(Date.now() - 86400000),
      auctionEnd: new Date(Date.now() + 5 * 86400000),
      fuelType: "Diesel",
      transmission: "Automatyczna",
      provider: "Seed",
      source: "API",
      images: {
        create: [
          {
            url: "https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&h=600",
            order: 0,
          },
        ],
      },
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
