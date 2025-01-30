import { Subscription } from "@prisma/client";
import Stripe from "stripe";

export interface ISubscriptionService {
    createCheckoutSession(userId: string, planId: string): Promise<string>;
    getSubscriptionsByUser(userId : string) : Promise<Subscription | null>;
    subscriptionSuccess(sessionId: string): Promise<void>;
    updateSubscription(stripeSubscriptionId: string, updates: Partial<Subscription>): Promise<void>;
    handleSubscriptionExpired(subscription: Stripe.Subscription): Promise<void>;
    handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void>;
    handlePaymentFailed(invoice: Stripe.Invoice): Promise<void>;
    createBillingPortalSession(customerId: string): Promise<string>;
    cancelSubscription(userId: string, stripeSubscriptionId: string): Promise<void>;
    renewSubscription(userId: string, stripeSubscriptionId: string): Promise<Subscription>;
}
  