/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Payout` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminId]` on the table `Payout` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payout_userId_key" ON "Payout"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_adminId_key" ON "Payout"("adminId");
