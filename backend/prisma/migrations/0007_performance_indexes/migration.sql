-- CreateIndex
CREATE INDEX "Car_adminDismissed_auctionEnd_idx" ON "Car"("adminDismissed", "auctionEnd");

-- CreateIndex
CREATE INDEX "Car_auctionEnd_idx" ON "Car"("auctionEnd");

-- CreateIndex
CREATE INDEX "Car_createdAt_idx" ON "Car"("createdAt");

-- CreateIndex
CREATE INDEX "CarImage_carId_order_idx" ON "CarImage"("carId", "order");

-- CreateIndex
CREATE INDEX "Offer_carId_idx" ON "Offer"("carId");

-- CreateIndex
CREATE INDEX "Offer_userId_idx" ON "Offer"("userId");

-- CreateIndex
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");

-- CreateIndex
CREATE INDEX "Favorite_carId_idx" ON "Favorite"("carId");

-- CreateIndex
CREATE INDEX "Favorite_createdAt_idx" ON "Favorite"("createdAt");
