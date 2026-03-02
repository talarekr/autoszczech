export type CarImage = {
  id: number;
  url: string;
  order: number;
};

export type Car = {
  id: number;
  displayId: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number | null;
  location: string | null;
  description: string | null;
  auctionStart: string | null;
  auctionEnd: string | null;
  provider: string | null;
  images: CarImage[];
};

export type User = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "USER" | "ADMIN";
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Offer = {
  id: number;
  amount: number;
  message: string | null;
  createdAt: string;
  car: Car;
};

export type Favorite = {
  id: number;
  car: Car;
};
