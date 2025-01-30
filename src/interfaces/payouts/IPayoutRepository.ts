import { EngagementMetrics, Payout } from '@prisma/client';

export interface IPayoutRepository {
  getPayoutsByUser(userId: string): Promise<Payout[]>;
  updatePayout(payoutId: string, updatedData: Partial<Payout>): Promise<void>;
  getPayoutByVideoId(videoId: string): Promise<Payout | null>;
  createOrUpdatePayout(contentId: string, userId: string, amountEarned: number,totalViews: number, incrementalViews: number): Promise<void>;
  updateEngagementMetrics(videoId: string, data: any): Promise<EngagementMetrics>;getEngagementMetrics(videoId: string): Promise<EngagementMetrics | null>;
}