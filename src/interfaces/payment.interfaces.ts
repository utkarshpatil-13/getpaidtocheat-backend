export interface Payout {
    id: string;
    userId: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    payoutMethod: string; // e.g., PayPal, CashApp, Litecoin
    transactionId?: string;
    requestedAt: Date;
    processedAt?: Date;
  }
  