import { IPayoutRepository } from '../interfaces/payouts/IPayoutRepository';
import { PrismaClient, Payout, EngagementMetrics } from '@prisma/client';

export class PayoutRepository implements IPayoutRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getPayoutsByUser(userId: string): Promise<Payout[]> {
    return await this.prisma.payout.findMany({
      where: { userId },
    });
  }

  async updatePayout(payoutId: string, updatedData: Partial<Payout>): Promise<void> {
    await this.prisma.payout.update({
      where: { id: payoutId },
      data: updatedData,
    });
  }

  async getPayoutByVideoId(contentId: string): Promise<Payout | null> {
    return await this.prisma.payout.findUnique({
      where: { contentId },
    });
  }

  /**
   * Create or Update Payout for a Video
   */
  async createOrUpdatePayout(contentId: string, userId: string, amountEarned: number, totalViews: number, incrementalViews: number): Promise<void> {
    const existingPayout = await this.getPayoutByVideoId(contentId);

    if (existingPayout) {
      // Update existing payout
      const updatedAmountEarned = existingPayout.amountEarned + amountEarned;

      await this.prisma.payout.update({
        where: { id: existingPayout.id },
        data: {
          amountEarned: updatedAmountEarned,
          totalViews,
          incrementalViews,
          status: 'approved',
        },
      });
    } else {
      // Create new payout entry
      await this.prisma.payout.create({
        data: {
          contentId,
          userId,
          amountEarned,
          totalViews,
          incrementalViews,
          amountDisbursed: 0,
          balanceDue: 0,
          status: 'approved',
        },
      });
    }
  }

  async getEngagementMetrics(contentId: string): Promise<EngagementMetrics | null> {
    return this.prisma.engagementMetrics.findUnique({ where: { contentId } });
  }

  async updateEngagementMetrics(contentId: string, data: any): Promise<EngagementMetrics> {
    return this.prisma.engagementMetrics.update({
      where: { contentId },
      data,
    });
  }
}
