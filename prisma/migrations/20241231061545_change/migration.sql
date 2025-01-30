/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeSubscriptionId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'paid',
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "renewalDate" TIMESTAMP(3),
ADD COLUMN     "stripeSubscriptionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
