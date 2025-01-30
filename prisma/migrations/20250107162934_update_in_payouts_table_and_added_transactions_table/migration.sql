/*
  Warnings:

  - You are about to drop the column `adminId` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `engagementScore` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `payoutMethod` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `requestedAt` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Payout` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contentId]` on the table `Payout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentId` to the `Payout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_adminId_fkey";

-- DropIndex
DROP INDEX "Payout_userId_key";

-- AlterTable
ALTER TABLE "EngagementMetrics" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastPayoutViews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "adminId",
DROP COLUMN "amount",
DROP COLUMN "comments",
DROP COLUMN "engagementScore",
DROP COLUMN "likes",
DROP COLUMN "payoutMethod",
DROP COLUMN "processedAt",
DROP COLUMN "requestedAt",
DROP COLUMN "transactionId",
DROP COLUMN "views",
ADD COLUMN     "amountDisbursed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "amountEarned" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "balanceDue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "contentId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "incrementalViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payout_contentId_key" ON "Payout"("contentId");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
