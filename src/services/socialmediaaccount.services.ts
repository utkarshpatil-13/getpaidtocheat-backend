import YouTubeApiClient from '@utils/youtubeapi.client.utils';
import { ISocialMediaAccountService } from '../interfaces/socialmedia/ISocialMediaAccountService';
import { SocialMediaAccountRepository } from '../repositories/socialmediaaccount.repositories';
import { ApiError } from '@utils/apierror';
import { SocialMediaAccount } from '@prisma/client';
import { asyncHandler } from '@utils/asynchandler';

export class SocialMediaAccountService implements ISocialMediaAccountService {
  private repository: SocialMediaAccountRepository;

  constructor() {
    this.repository = new SocialMediaAccountRepository();
  }

  async getAccountByUserId(userId: string, platform: string) {
    try {
      return await this.repository.getAccountByUserId(userId, platform);
    } catch (error) {
      console.error('Error in service layer:', error);
      throw new ApiError(400, 'Failed to retrieve social media account.');
    }
  }

  async updateTokens(userId: string, platform: string): Promise<any> {
    const account = await this.getAccountByUserId(userId, platform);
  
    if (!account) {
      throw new ApiError(404, 'Social Media Account not found');
    }
  
    if (!account.refresh_token) {
      throw new ApiError(400, 'No refresh token available to generate new access tokens');
    }
  
    const { access_token, token_expiry } = await YouTubeApiClient.refreshAccessToken(account.refresh_token);
  
    const updatedAccount = await this.repository.updateTokens(userId, platform, {
      access_token,
      token_expiry,
    });
  
    return updatedAccount;
  }

  async createAccount(accountData: {
    userId: string;
    platform: string;
    accountId: string;
    accountName: string;
    access_token?: string;
    refresh_token?: string;
    token_expiry?: Date;
  }) {
    try {
      return await this.repository.createAccount(accountData);
    } catch (error) {
      console.error('Error in service layer:', error);
      throw new Error('Failed to create social media account.');
    }
  }

  async updateAccount(accountId: string, accountData: {
    accountName?: string;
    access_token?: string;
    refresh_token?: string;
    token_expiry?: Date;
  }){
    return await this.repository.updateAccount(accountId, accountData);
  } 

  
}
