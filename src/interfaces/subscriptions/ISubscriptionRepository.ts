import { Subscription } from '@prisma/client';

export interface ISubscriptionRepository {
  createCheckoutSession(userId: string, stripeCustomerId: string, stripeSubscriptionId: string, productId: string, planId: string, startDate: Date, endDate: Date): Promise<Subscription>;
  getSubscriptionsByUser(userId : string) : Promise<Subscription | null>
  renewSubscription(userId: string, stripeSubscriptionId: string, updates: Partial<Subscription>): Promise<Subscription>
  updateSubscriptionStatus(stripeSubscriptionId: string, updates: Partial<Subscription>): Promise<void>
}
