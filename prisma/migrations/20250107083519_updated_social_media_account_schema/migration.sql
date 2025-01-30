/*
  Warnings:

  - A unique constraint covering the columns `[userId,platform]` on the table `SocialMediaAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SocialMediaAccount" ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "token_expiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaAccount_userId_platform_key" ON "SocialMediaAccount"("userId", "platform");
