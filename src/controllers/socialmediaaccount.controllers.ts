import { SocialMediaAccountService } from '../services/socialmediaaccount.services';
import { ApiResponse } from '@utils/apiresponse';
import { ApiError } from '@utils/apierror';
import {asyncHandler} from '@utils/asynchandler';
import { Context } from 'hono';

export class SocialMediaAccountController {
  private service: SocialMediaAccountService;

  constructor() {
    this.service = new SocialMediaAccountService();
  }

  /**
   * Get Social Media Account by User ID and Platform
   */
  getAccount = asyncHandler(async (c: Context) => {
    const user = c.get('user'); // Extracted from middleware
    const platform = c.req.query('platform');
    
    if (!platform) {
      throw new ApiError(400, 'Platform query parameter is required');
    }

    const account = await this.service.getAccountByUserId(user.id, platform);

    return c.json(new ApiResponse(200, account, 'Social media account retrieved successfully'));
  });

  /**
   * Update Tokens for Social Media Account
   */
  updateTokens = asyncHandler(async (c: Context) => {
    const user = c.get('user'); // Extracted from middleware
    const platform = c.req.query('platform');

    if (!platform) {
      throw new ApiError(400, 'Platform query parameter is required');
    }

    const updatedAccount = await this.service.updateTokens(user.id, platform);

    return c.json(new ApiResponse(200, updatedAccount, 'Social media tokens updated successfully'));
  });

  /**
   * Create a Social Media Account
   */
  createAccount = asyncHandler(async (c: Context) => {
    const body = await c.req.json();

    if (!body.userId || !body.platform || !body.accountId || !body.accountName) {
      throw new ApiError(400, 'Required fields are missing');
    }

    const accountData = {
      userId: body.userId,
      platform: body.platform,
      accountId: body.accountId,
      accountName: body.accountName,
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      token_expiry: body.token_expiry ? new Date(body.token_expiry) : undefined,
    };

    const newAccount = await this.service.createAccount(accountData);

    return c.json(new ApiResponse(201, newAccount, 'Social media account created successfully'));
  });
}
