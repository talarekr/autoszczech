-- Add winner status enum and column for auction results
CREATE TYPE "WinnerStatus" AS ENUM ('WON', 'AWARDED');

ALTER TABLE "Offer"
ADD COLUMN "winnerStatus" "WinnerStatus";
