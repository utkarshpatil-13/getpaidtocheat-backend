export interface Subscription {
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    productId: string;
    planId: string;
    status: "active" | "expired" | "cancelled";
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  