/*
  Warnings:

  - You are about to drop the column `contentId` on the `EngagementMetrics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[youtubeVideoId]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[youtubeVideoId]` on the table `EngagementMetrics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `youtubeVideoId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `youtubeVideoId` to the `EngagementMetrics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EngagementMetrics" DROP CONSTRAINT "EngagementMetrics_contentId_fkey";

-- DropIndex
DROP INDEX "EngagementMetrics_contentId_key";

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "youtubeVideoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EngagementMetrics" DROP COLUMN "contentId",
ADD COLUMN     "youtubeVideoId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Content_youtubeVideoId_key" ON "Content"("youtubeVideoId");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementMetrics_youtubeVideoId_key" ON "EngagementMetrics"("youtubeVideoId");

-- AddForeignKey
ALTER TABLE "EngagementMetrics" ADD CONSTRAINT "EngagementMetrics_youtubeVideoId_fkey" FOREIGN KEY ("youtubeVideoId") REFERENCES "Content"("youtubeVideoId") ON DELETE RESTRICT ON UPDATE CASCADE;
