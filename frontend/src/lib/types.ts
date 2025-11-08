export interface CarImage {
  id: number;
  url: string;
}

export interface OfferUser {
  email: string;
}

export interface Offer {
  id: number;
  amount: number;
  message?: string | null;
  createdAt: string;
  user?: OfferUser | null;
}

export interface Car {
  id: number;
  externalId?: string | null;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  location?: string | null;
  description?: string | null;
  auctionStart?: string | null;
  auctionEnd?: string | null;
  createdAt?: string;
  images: CarImage[];
  specs?: Record<string, unknown> | null;
  offers?: Offer[];
  _count?: { offers: number };
}

export interface AuthUser {
  email: string;
  role: "ADMIN" | "USER";
  token: string;
}
