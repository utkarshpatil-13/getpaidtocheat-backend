import { PrismaClient, Subscription } from '@prisma/client';
import { ISubscriptionRepository } from '../interfaces/subscriptions/ISubscriptionRepository';

class SubscriptionRepository implements ISubscriptionRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createCheckoutSession(userId: string, stripeCustomerId: string, stripeSubscriptionId: string, productId: string, planId: string, startDate: Date, endDate: Date): Promise<Subscription> {
    return await this.prisma.subscription.create({
      data: {
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        productId,
        planId,
        status: 'active',
        paymentStatus: 'paid',
        startDate,
        endDate,
      },
    });
  }

  async updateSubscriptionStatus(stripeSubscriptionId: string, updates: Partial<Subscription>): Promise<void> {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId },
      data: updates,
    });
  }

  async getSubscriptionsByUser(userId : string) : Promise<Subscription | null>{
    return await this.prisma.subscription.findFirst({
      where: {userId},
    })
  }

  async renewSubscription(userId: string, stripeSubscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    try {
        return await this.prisma.subscription.update({
            where: {
                userId,
                stripeSubscriptionId,
            },
            data: updates,
        });

    } catch (error) {
        console.error('Error renewing subscription in repository:', error);
        throw new Error('Failed to renew subscription.');
    }
}

}

// Singleton Pattern
const subscriptionRepositoryInstance = new SubscriptionRepository(new PrismaClient());
export default subscriptionRepositoryInstance;
