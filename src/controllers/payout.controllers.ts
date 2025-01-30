import { Context } from 'hono';
import { PayoutService } from '../services/payout.services';
import { ApiResponse } from '../utils/apiresponse';
import { asyncHandler } from '@utils/asynchandler';
import { ApiError } from '@utils/apierror';

export class PayoutController {
  private payoutService: PayoutService;

  constructor(payoutService: PayoutService) {
    this.payoutService = payoutService;
  }

  /**
   * Fetch Total Earned Amount Across All Videos
   */
  async getTotalEarned(c: Context) {
    try {
      const user = c.get('user');
      const totalEarned = await this.payoutService.calculateTotalEarned(user.id);

      return c.json(
        new ApiResponse(201, { totalEarned }, 'Total earned amount fetched successfully')
      );
    } catch (error: any) {
      return c.json(
        new ApiResponse(401, error.message || 'Failed to fetch total earned amount'),
        400
      );
    }
  }

  async approvePayout(c: Context) {
    console.log("inside approve payout controllers");
    try {
      const { userId, contentAmounts } = await c.req.json(); // This will be a map of contentId -> amount
  
      console.log(userId);
      console.log(contentAmounts);
      if (!userId || !contentAmounts || Object.keys(contentAmounts).length === 0) {
        return c.json(
          new ApiResponse(400, 'userId and contentAmounts (contentId -> amount) are required')
        );
      }
  
      const payoutResults = await this.payoutService.approvePayout(userId, contentAmounts);
  
      return c.json(
        new ApiResponse(200, payoutResults, 'Payouts approved successfully'),
        200
      );
    } catch (error: any) {
      throw error;
      // return c.json(new ApiResponse(401, error.message || 'Failed to approve payouts!'));
    }
  }

  getUserPayouts = asyncHandler(async(c: Context) => {
    let user = c.get('user');

    if(!user){
      throw new ApiError(404, 'User did not found in Payouts');
    }

    // get information of user from payouts
    const payouts = await this.payoutService.getUserPayouts(user.id);

    return c.json(new ApiResponse(201, payouts, `Payouts of ${user.username}`));

  });


  async processPayout(c: Context) {
    try {
      let user = c.get('user');
      const { amount } = await c.req.json();

      if (!user.id || !amount) {
        return c.json(
          new ApiResponse(400, 'userId and amount are required'),
          400
        );
      }

      // Step 1: Check for Stripe Account
      let stripeAccountId = user?.stripeAccountId;
      if (!stripeAccountId) {
        // Generate onboarding link and send it to the client
        const onboardingLink = await this.payoutService.createStripeAccountLink(user.id);
        // return c.json(
        //   new ApiResponse(302, { onboardingLink }, 'Redirect to Stripe onboarding to set up your payout account'),
        //   302
        // );

        return c.redirect(onboardingLink);
      }

      // Step 2: Process Payout
      const payout = await this.payoutService.processPayout(user.id, stripeAccountId, amount);

      return c.json(
        new ApiResponse(200, payout, 'Payout processed successfully!'),
        200
      );

    } catch (error: any) {
      return c.json(
        new ApiResponse(400, error.message || 'Failed to process payout!'),
        400
      );
    }
  }

  /**
 * Stripe Onboarding Success Callback
 */
  async stripeOnboardingSuccess(c: Context) {
    try {
      const userId = c.req.query('userId');
      if (!userId) {
        return c.json(new ApiResponse(400, 'UserId is required in query params'), 400);
      }

      await this.payoutService.handleStripeAccountCallback(userId);

      return c.json(
        new ApiResponse(200, 'Stripe onboarding completed successfully. You can now process payouts!'),
        200
      );
    } catch (error: any) {
      return c.json(
        new ApiResponse(400, error.message || 'Failed to complete Stripe onboarding!'),
        400
      );
    }
  }

  /**
   * Stripe Onboarding Refresh Callback
   */
  async stripeOnboardingRefresh(c: Context) {
    try {
      const userId = c.req.query('userId');
      if (!userId) {
        return c.json(new ApiResponse(400, 'UserId is required in query params'), 400);
      }

      // Regenerate Stripe onboarding link
      const onboardingLink = await this.payoutService.createStripeAccountLink(userId);

      return c.json(
        new ApiResponse(302, { onboardingLink }, 'Redirect to Stripe onboarding to complete your setup'),
        302
      );
    } catch (error: any) {
      return c.json(
        new ApiResponse(400, error.message || 'Failed to refresh Stripe onboarding link!'),
        400
      );
    }
  }

  // /**
  //  * Disburse Total Amount Across Videos
  //  */
  // async disburseTotalAmount(c: Context) {
  //   try {
  //     const { disburseAmount } = await c.req.json();
  //     const user = c.get('user');
  //     await this.payoutService.disburseTotalAmount(user.id, disburseAmount);

  //     return c.json(
  //       new ApiResponse(201, 'Amount disbursed successfully across all videos')
  //     );
  //   } catch (error: any) {
  //     return c.json(
  //       new ApiResponse(401, error.message || 'Failed to disburse amount'),
  //       400
  //     );
  //   }
  // }
}
