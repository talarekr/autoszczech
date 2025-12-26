import type { DescriptionEntry } from "@shared/importers/insurance";

export interface CarImage {
  id?: number;
  url: string;
}

export type WinnerStatus = "WON" | "AWARDED";

export interface CarOffer {
  id: number;
  amount: number;
  createdAt: string;
  userId: number;
  isWinner?: boolean;
  winnerStatus?: WinnerStatus | null;
  user?: { id: number; email: string };
}

export type CarSource = "sample" | "api" | "imported";

export interface Car {
  id: number;
  displayId?: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price?: number | null;
  location?: string | null;
  description?: string | null;
  descriptionDetails?: DescriptionEntry[];
  auctionStart?: string | null;
  auctionEnd?: string | null;
  provider?: string | null;
  vin?: string | null;
  registrationNumber?: string | null;
  firstRegistrationDate?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  driveType?: string | null;
  power?: string | null;
  seats?: number | null;
  doors?: number | null;
  adminDismissed?: boolean;
  images?: CarImage[];
  offers?: CarOffer[];
  source?: CarSource;
}

export interface Favorite {
  id: number;
  carId: number;
  createdAt: string;
  car: Car;
}
