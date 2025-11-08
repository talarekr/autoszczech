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
      externalId: "102807",
      make: "Hyundai",
      model: "i20 1.4 Style",
      year: 2016,
      mileage: 101000,
      price: 32900,
      description: "Bogata wersja wyposażenia Style, pierwszy właściciel, pełna historia serwisowa.",
      location: "Bern, Szwajcaria",
      auctionStart: new Date(Date.now() - 3600 * 1000),
      auctionEnd: new Date(Date.now() + 6 * 24 * 3600 * 1000 + 2 * 3600 * 1000 + 7 * 60 * 1000),
      specs: {
        vin: "KMHSH51H5HU276804",
        bodyType: "Hatchback",
        transmission: "Automatyczna",
        fuelType: "Benzyna",
        power: "100 KM",
        engine: "1.4 100 KM",
        color: "Srebrny",
        registration: "2016-03-12",
      },
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1b?auto=format&fit=crop&w=1200&q=80" },
          { url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80" },
          { url: "https://images.unsplash.com/photo-1511393812214-0ac75ae3716e?auto=format&fit=crop&w=800&q=80" },
          { url: "https://images.unsplash.com/photo-1471440671318-55bdbb772f93?auto=format&fit=crop&w=800&q=80" },
        ],
      },
    },
    {
      externalId: "928411",
      make: "BMW",
      model: "Seria 3 320d xDrive",
      year: 2018,
      mileage: 89000,
      price: 82900,
      description: "Napęd xDrive, pakiet M, serwisowany w ASO. Importowany prosto z Zurychu.",
      location: "Zurych, Szwajcaria",
      auctionStart: new Date(Date.now() - 2 * 3600 * 1000),
      auctionEnd: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 10 * 60 * 1000),
      specs: {
        vin: "WBA8D31020A928411",
        bodyType: "Sedan",
        transmission: "Automatyczna",
        fuelType: "Diesel",
        power: "190 KM",
        drivetrain: "xDrive",
        color: "Biały",
        registration: "2018-06-01",
      },
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1617813489428-7ed2dbe89375?auto=format&fit=crop&w=1200&q=80" },
          { url: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=800&q=80" },
          { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80" },
        ],
      },
    },
    {
      externalId: "774512",
      make: "Audi",
      model: "A4 Avant 2.0 TFSI",
      year: 2017,
      mileage: 112000,
      price: 68900,
      description: "S-line, kamera cofania, adaptacyjny tempomat. Idealny stan wizualny i techniczny.",
      location: "Genewa, Szwajcaria",
      auctionStart: new Date(Date.now() - 4 * 3600 * 1000),
      auctionEnd: new Date(Date.now() + 24 * 3600 * 1000 + 3 * 3600 * 1000 + 30 * 60 * 1000),
      specs: {
        vin: "WAUZZZF49HN774512",
        bodyType: "Kombi",
        transmission: "Automatyczna",
        fuelType: "Benzyna",
        power: "252 KM",
        drivetrain: "quattro",
        color: "Szary Daytona",
        registration: "2017-09-20",
      },
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80" },
          { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
          { url: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=800&q=80" },
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
