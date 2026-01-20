-- Add winner flag to offers so admins can mark winning bids
ALTER TABLE "Offer" ADD COLUMN "isWinner" BOOLEAN NOT NULL DEFAULT false;
