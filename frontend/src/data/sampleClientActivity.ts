export type ClientAuctionStatus = "leading" | "outbid" | "awaiting";

export interface ClientAuctionHistoryEntry {
  carId: number;
  lastBidAmount: number;
  lastBidAt: string;
  status: ClientAuctionStatus;
  totalBids: number;
}

export interface ClientWonAuctionEntry {
  carId: number;
  wonAt: string;
  finalPrice: number;
  deliveryStatus: "scheduled" | "inTransit" | "delivered";
}

export const clientBiddingHistory: ClientAuctionHistoryEntry[] = [
  {
    carId: 101001,
    lastBidAmount: 126000,
    lastBidAt: "2025-11-08T09:20:00Z",
    status: "outbid",
    totalBids: 4,
  },
  {
    carId: 101002,
    lastBidAmount: 109500,
    lastBidAt: "2025-11-06T15:42:00Z",
    status: "leading",
    totalBids: 2,
  },
  {
    carId: 101003,
    lastBidAmount: 187000,
    lastBidAt: "2025-11-08T09:55:00Z",
    status: "awaiting",
    totalBids: 3,
  },
];

export const clientWonAuctions: ClientWonAuctionEntry[] = [
  {
    carId: 101004,
    wonAt: "2025-09-12T16:30:00Z",
    finalPrice: 94500,
    deliveryStatus: "delivered",
  },
  {
    carId: 101005,
    wonAt: "2025-07-28T11:10:00Z",
    finalPrice: 68500,
    deliveryStatus: "inTransit",
  },
];

