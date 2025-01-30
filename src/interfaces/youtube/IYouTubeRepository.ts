import { Content, EngagementMetrics } from '@prisma/client';

export interface IYoutubeRepository {
  createContentWithMetrics(data: Partial<Content>) : Promise<any>;
  updateMetrics(contentId: string, metrics: any): Promise<void>;
  getContent(id: string) : Promise<any>;
  getAllContent(userId : string) : Promise<Content[]>;
}