import type { AuthResponse, Car, Favorite, Offer } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "") || "https://autoszczech-backend.onrender.com";

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Błąd API" }));
    throw new Error(payload.error || "Błąd API");
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: { email: string; password: string; firstName: string; lastName: string }) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getCars: () => request<Car[]>("/api/cars"),
  getCar: (id: number) => request<Car>(`/api/cars/${id}`),
  getFavorites: (token: string) => request<Favorite[]>("/api/favorites", undefined, token),
  addFavorite: (token: string, carId: number) =>
    request<Favorite>("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ carId }),
    }, token),
  removeFavorite: (token: string, carId: number) =>
    request<{ success: boolean }>(`/api/favorites/${carId}`, {
      method: "DELETE",
    }, token),
  placeOffer: (token: string, payload: { carId: number; amount: number; message?: string }) =>
    request<Offer>("/api/offers", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token),
  myOffers: (token: string) => request<Offer[]>("/api/offers/mine", undefined, token),
};
