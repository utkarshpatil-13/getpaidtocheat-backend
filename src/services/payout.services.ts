import { IPayoutService } from '../interfaces/payouts/IPayoutService';
import { PayoutRepository } from '../repositories/payout.repositories';
import Stripe from 'stripe';
import { Payout, Transaction } from '@prisma/client';
import { TransactionService } from './transactions.services';
import userService from './user.services';
import { ApiError } from '@utils/apierror';
import { IPayoutRepository } from '../interfaces/payouts/IPayoutRepository';
import { ITransactionService } from '../interfaces/transactions/ITransactionService';
import { asyncHandler } from '@utils/asynchandler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export class PayoutService implements IPayoutService {
  private payoutRepository: IPayoutRepository;
  private transactionService : ITransactionService;

  constructor(payoutRepository: IPayoutRepository, transactionService : ITransactionService) {
    this.payoutRepository = payoutRepository;
    this.transactionService = transactionService;
  }

  async approvePayout(userId: string, contentAmounts: Record<string, number>): Promise<any[]> {
    console.log("inside approve payout services");
    const payoutResults: any[] = [];
    
    for (const [contentId, amount] of Object.entries(contentAmounts)) {
      try {
        const engagementMetrics = await this.payoutRepository.getEngagementMetrics(contentId);
  
        if (!engagementMetrics) {
          throw new ApiError(404, `Engagement Metrics not found for video with contentId: ${contentId}`);
        }
  
        const incrementalViews = engagementMetrics.views - engagementMetrics.lastPayoutViews;
  
        await this.payoutRepository.updateEngagementMetrics(contentId, {
          lastPayoutViews: engagementMetrics.views,
        });
  
        const payout = await this.payoutRepository.createOrUpdatePayout(contentId, userId, amount, 
          engagementMetrics.views, incrementalViews);
        
        payoutResults.push({ contentId, payout, status: 'approved' });
      } catch (error: any) {
        console.error(error);  // Log the error for debugging
        payoutResults.push({ contentId, error: error.message || 'Failed to approve payout' });
        throw error;
      }
    }
  
    return payoutResults;
  }

  /**
   * Calculate Total Amount Earned Across All Videos
   */
  async calculateTotalEarned(userId: string): Promise<number> {
    const payouts = await this.payoutRepository.getPayoutsByUser(userId);
    return payouts.reduce((sum, payout) => sum + (payout.amountEarned + payout.balanceDue), 0);
  }

  /**
   * Proportionally Disburse Total Amount Across Videos
   */
  async disburseTotalAmount(userId: string, totalEarned: number, disburseAmount: number): Promise<void> {
    const payouts = await this.payoutRepository.getPayoutsByUser(userId);

    if (disburseAmount > totalEarned) {
      throw new ApiError(500, 'Disbursed amount exceeds total earned revenue.');
    } 

    // Proportional Distribution
    for (const payout of payouts) {
      const videoContribution = (payout.amountEarned + payout.balanceDue) / totalEarned;
      const videoDisbursement = disburseAmount * videoContribution;

      const updatedAmountDisbursed = payout.amountDisbursed + videoDisbursement;
      const updatedBalanceDue = (payout.amountEarned + payout.balanceDue) - updatedAmountDisbursed;

      await this.payoutRepository.updatePayout(payout.id, {
        amountEarned : 0,
        amountDisbursed: updatedAmountDisbursed,
        balanceDue: updatedBalanceDue,
        status: updatedBalanceDue === 0 ? 'paid' : 'partially_paid',
      });
    }
  }

  /**
   * Process User Payout with Bank Details
   * @param userId - ID of the User
   * @param payoutAmount - Total Amount requested by the user
   * @param bankDetails - User's Bank Details for Stripe Payout
   */
  async processPayout(userId: string, stripeAccountId: string, payoutAmount: number): Promise<Partial<Transaction>> {
    const payouts = await this.payoutRepository.getPayoutsByUser(userId);
    const totalEarned =  payouts
    ?.filter((payout) => payout.status === 'approved')
    .reduce((sum, payout) => sum + payout.amountEarned + payout.amountDisbursed, 0) || 0;
  
    // Step 1: Calculate Total Available Balance
    if (payoutAmount > totalEarned) {
      throw new Error('Requested amount exceeds available balance');
    }
  
    // Step 2: Transfer Funds via Stripe
    const transfer = await stripe.transfers.create({
      amount: Math.round(payoutAmount * 100), // Stripe accepts amounts in cents
      currency: 'usd',
      destination: stripeAccountId,
      description: `Payout for user ID: ${userId}`,
    });
  
    // Step 3: Create Transaction Record
    const transaction: Partial<Transaction> = {
      userId,
      amount: payoutAmount,
      transactionId: transfer.id as string,
      paymentMethod: 'stripe',
      status: 'completed',
      subscriptionId: null, // Optional field
    };
  
    // Pass the transaction object to the service method
    const createdTransaction = await this.transactionService.createTransaction(transaction as Transaction);
  
    // Step 4: Disburse Total Amount
    await this.disburseTotalAmount(userId, totalEarned, payoutAmount);
    console.log('Amount disbursed successfully across all videos');
  
    return createdTransaction;
  }
  
  /**
   * Generate Stripe Onboarding Link for User
   */
  async createStripeAccountLink(userId: string): Promise<string> {
    const user = await userService.getUserById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let stripeAccountId = user.stripeAccountId;

    // Step 1: Create Stripe Account if not exists
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      // Temporarily save stripeAccountId to avoid duplication
      await userService.updateUser(userId, { stripeAccountId });
    }

    // Step 2: Create Onboarding Link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.SERVER_URL}/api/payout/stripe/onboarding/refresh`,
      return_url: `${process.env.SERVER_URL}/api/payout/stripe/onboarding/success?userId=${userId}`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Handle Stripe Onboarding Callback
   */
  async handleStripeAccountCallback(userId: string): Promise<void> {
    const user = await userService.getUserById(userId);

    if (!user?.stripeAccountId) {
      throw new ApiError(400, 'No Stripe account associated with this user');
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    if (account.details_submitted) {
      // Stripe onboarding completed
      await userService.updateUser(userId, { stripeAccountStatus: 'active' });
    } else {
      throw new ApiError(400, 'Stripe account details are incomplete');
    }
  }

  async getUserPayouts(userId : string) : Promise<Payout[]>{
    if(!userId){
      throw new ApiError(404, 'UserId not found in payouts services');
    }

    const payouts = await this.payoutRepository.getPayoutsByUser(userId);

    if(!payouts){
      throw new ApiError(400, 'Payouts not found');
    }

    return payouts;
  }
}
