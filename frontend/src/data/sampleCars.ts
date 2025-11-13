import { Car } from "../types/car";

export const sampleCars: Car[] = [
  {
    id: 101001,
    displayId: "101001",
    make: "Audi",
    model: "Q5 45 TFSI quattro",
    year: 2021,
    mileage: 48000,
    price: 128000,
    location: "Szwajcaria, Zurych",
    description:
      "SUV klasy premium z napędem quattro i bogatym wyposażeniem. Regularnie serwisowany w ASO Audi. Idealny kompromis pomiędzy komfortem a dynamiką.",
    auctionStart: "2025-11-04T08:00:00Z",
    auctionEnd: "2025-11-15T18:00:00Z",
    provider: "Helvetia Leasing",
    vin: "WAUZZZF49M1234567",
    registrationNumber: "ZH-48291",
    firstRegistrationDate: "2021-03-12",
    fuelType: "Benzyna",
    transmission: "Automatyczna",
    images: [
      {
        id: 1,
        url:
          "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: 2,
        url:
          "https://images.unsplash.com/photo-1583267747034-6c1dfb4d67a9?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: 3,
        url:
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    offers: [
      { id: 201, amount: 120000, createdAt: "2025-11-06T10:30:00Z", userId: 5 },
      { id: 202, amount: 124500, createdAt: "2025-11-07T14:45:00Z", userId: 8 },
      { id: 203, amount: 126000, createdAt: "2025-11-08T09:20:00Z", userId: 11 },
    ],
    source: "sample",
  },
  {
    id: 101002,
    displayId: "101002",
    make: "BMW",
    model: "X3 xDrive30d",
    year: 2019,
    mileage: 86500,
    price: 112500,
    location: "Szwajcaria, Lucerna",
    description:
      "Egzemplarz po jednym właścicielu, pełna historia serwisowa. Silnik 3.0d z automatyczną skrzynią i napędem na cztery koła.",
    auctionStart: "2025-11-03T09:00:00Z",
    auctionEnd: "2025-11-15T18:00:00Z",
    provider: "AXA Remarketing",
    vin: "WBAWY71030L123456",
    registrationNumber: "LU-91234",
    firstRegistrationDate: "2019-06-20",
    fuelType: "Diesel",
    transmission: "Automatyczna",
    images: [
      {
        id: 4,
        url:
          "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: 5,
        url:
          "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    offers: [
      { id: 204, amount: 108000, createdAt: "2025-11-05T12:05:00Z", userId: 7 },
      { id: 205, amount: 109500, createdAt: "2025-11-06T15:42:00Z", userId: 9 },
    ],
    source: "sample",
  },
  {
    id: 101003,
    displayId: "101003",
    make: "Tesla",
    model: "Model 3 Long Range",
    year: 2022,
    mileage: 26500,
    price: 189000,
    location: "Szwajcaria, Lozanna",
    description:
      "Samochód elektryczny z napędem na obie osie, autopilotem i pakietem zimowym. Stan bardzo dobry, gwarancja producenta.",
    auctionStart: "2025-11-02T07:30:00Z",
    auctionEnd: "2025-11-15T18:00:00Z",
    provider: "Swiss Mobility",
    vin: "5YJ3E7EB0NF123456",
    registrationNumber: "VD-305678",
    firstRegistrationDate: "2022-04-04",
    fuelType: "Elektryczny",
    transmission: "Automatyczna",
    images: [
      {
        id: 6,
        url:
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: 7,
        url:
          "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    offers: [
      { id: 206, amount: 182000, createdAt: "2025-11-04T11:15:00Z", userId: 6 },
      { id: 207, amount: 185500, createdAt: "2025-11-07T16:00:00Z", userId: 10 },
      { id: 208, amount: 187000, createdAt: "2025-11-08T09:55:00Z", userId: 12 },
    ],
    source: "sample",
  },
  {
    id: 101004,
    displayId: "101004",
    make: "Mercedes-Benz",
    model: "GLC 300 4MATIC",
    year: 2020,
    mileage: 52000,
    price: 154000,
    location: "Szwajcaria, Bazylea",
    description:
      "Elegancki SUV klasy premium z napędem 4MATIC, pakietem AMG Line oraz pełną historią serwisową w ASO.",
    auctionStart: "2025-09-01T08:00:00Z",
    auctionEnd: "2025-09-12T16:00:00Z",
    provider: "BCP Remarketing",
    vin: "W1N0G8EB2LF123456",
    registrationNumber: "BS-49281",
    firstRegistrationDate: "2020-02-18",
    fuelType: "Benzyna",
    transmission: "Automatyczna",
    images: [
      {
        id: 8,
        url:
          "https://images.unsplash.com/photo-1586843619593-3eaa57a8c3a0?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: 9,
        url:
          "https://images.unsplash.com/photo-1549921296-3ecf9c4f6872?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    offers: [
      { id: 209, amount: 91000, createdAt: "2025-09-05T10:10:00Z", userId: 5 },
      { id: 210, amount: 93000, createdAt: "2025-09-08T13:35:00Z", userId: 6 },
      { id: 211, amount: 94500, createdAt: "2025-09-12T15:20:00Z", userId: 5 },
    ],
    source: "sample",
  },
  {
    id: 101005,
    displayId: "101005",
    make: "Volvo",
    model: "XC60 B4 AWD", 
    year: 2019,
    mileage: 74000,
    price: 118000,
    location: "Szwajcaria, Berno",
    description:
      "Komfortowy SUV z napędem AWD, pakietem IntelliSafe oraz nagłośnieniem Harman Kardon. Regularnie serwisowany.",
    auctionStart: "2025-07-10T09:30:00Z",
    auctionEnd: "2025-07-28T10:45:00Z",
    provider: "Swiss Mobility",
    vin: "YV1UZ10D1L1234567",
    registrationNumber: "BE-33921",
    firstRegistrationDate: "2019-05-07",
    fuelType: "Diesel",
    transmission: "Automatyczna",
    images: [
      {
        id: 10,
        url:
          "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: 11,
        url:
          "https://images.unsplash.com/photo-1502872364588-894d7d6ddfab?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    offers: [
      { id: 212, amount: 65500, createdAt: "2025-07-20T11:00:00Z", userId: 5 },
      { id: 213, amount: 68500, createdAt: "2025-07-28T10:30:00Z", userId: 5 },
    ],
    source: "sample",
  },
];

export default sampleCars;
