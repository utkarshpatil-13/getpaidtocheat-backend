import { ApiError } from "@utils/apierror";
import { IYoutubeRepository } from "../interfaces/youtube/IYouTubeRepository";
import { OAuthClient } from "../utils/youtube.utils";
import { PrismaClient, Content, EngagementMetrics } from '@prisma/client';

const prisma = new PrismaClient();

export class YoutubeRepository implements IYoutubeRepository {
  private oauthClient: OAuthClient;

  constructor(oauthClient: OAuthClient) {
    this.oauthClient = oauthClient;
  }

  generateAuthUrl(scopes: string[]): string {
    return this.oauthClient.generateAuthUrl(scopes);
  }

  async getTokens(code: string) {
    return this.oauthClient.getTokens(code);
  }

  async createContentWithMetrics(data: Partial<Content>) {
    return await prisma.$transaction(async (tx) => {
      // 1️⃣ Create Content Entry
      const content = await tx.content.create({
        data: {
          userId: data.userId as string,
          title: data.title as string,
          description: data.description as string,
          videoUrl: data.videoUrl as string,
          youtubeVideoId: data.youtubeVideoId as string,
          thumbnailUrl: data.thumbnailUrl || null,
          status: data.status || 'pending',
          uploadedAt: data.uploadedAt || new Date(),
          verifiedAt: data.verifiedAt || null,
          adminId: data.adminId || null,
        },
      });
  
      // 2️⃣ Create Engagement Metrics Entry
      await tx.engagementMetrics.create({
        data: {
          contentId: content.id, // Automatically references Content.id
          views: 0,
          likes: 0,
          comments: 0,
          engagementScore: 0.0,
        },
      });
  
      // 3️⃣ Fetch Full Content with Metrics
      return await tx.content.findUnique({
        where: { id: content.id },
        include: {
          metrics: true, // Include EngagementMetrics in the response
        },
      });
    });
  }

  async updateMetrics(contentId: string, metrics: any): Promise<void> {
    await prisma.engagementMetrics.upsert({
      where: { contentId },
      update: {
        views: parseFloat(metrics.views) || 0,
        likes: parseFloat(metrics.likes) || 0,
        comments: parseFloat(metrics.comments) || 0,
        engagementScore: metrics.engagementScore || 0.0,
      },
      create: {
        contentId,
        views: parseFloat(metrics.views) || 0,
        likes: parseFloat(metrics.likes) || 0,
        comments: parseFloat(metrics.comments) || 0,
        engagementScore: metrics.engagementScore || 0.0,
      },
    });
  }

  async getContent(id: string) {
    return await prisma.content.findUnique({
      where: { id },
      include: { metrics: true },
    });
  }

  /**
   * Get all video contents uploaded by a user.
   */
  async getAllContent(userId: string): Promise<Content[]> {
    return await prisma.content.findMany({
      where: { userId },
      include: {
        metrics: true,
      },
    });
  }
}
