/*
  Warnings:

  - You are about to drop the column `youtubeVideoId` on the `EngagementMetrics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contentId]` on the table `EngagementMetrics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentId` to the `EngagementMetrics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EngagementMetrics" DROP CONSTRAINT "EngagementMetrics_youtubeVideoId_fkey";

-- DropIndex
DROP INDEX "EngagementMetrics_youtubeVideoId_key";

-- AlterTable
ALTER TABLE "EngagementMetrics" DROP COLUMN "youtubeVideoId",
ADD COLUMN     "contentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EngagementMetrics_contentId_key" ON "EngagementMetrics"("contentId");

-- AddForeignKey
ALTER TABLE "EngagementMetrics" ADD CONSTRAINT "EngagementMetrics_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
