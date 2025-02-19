import { PrismaClient } from '@prisma/client';
import { ISocialMediaAccountRepository } from '../interfaces/socialmedia/ISocialMediaRepository';

const prisma = new PrismaClient();

export class SocialMediaAccountRepository implements ISocialMediaAccountRepository {

  async getAccountByUserId(userId: string, platform: string) {
    try {
      const account = await prisma.socialMediaAccount.findFirst({
        where: {
          userId,
          platform,
        },
      });
      return account; // Return `null` if account is not found instead of throwing an error
    } catch (error) {
      console.error('Error fetching social media account by user and platform:', error);
      throw new Error('Failed to fetch social media account.');
    }
}

  async updateTokens(userId: string, platform: string, tokenData: {
    access_token?: string;
    token_expiry?: Date;
  }) {
    try {
      const account = await prisma.socialMediaAccount.findFirst({
        where: {
          userId,
          platform,
        },
      });

      if (!account) {
        throw new Error('Account not found.');
      }

      const updatedAccount = await prisma.socialMediaAccount.update({
        where: {
          id: account.id,  // Use the id of the fetched account
        },
        data: tokenData,
      });

      return updatedAccount;
    } catch (error) {
      console.error('Error updating tokens for social media account:', error);
      throw new Error('Failed to update social media account tokens.');
    }
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
      const newAccount = await prisma.socialMediaAccount.create({
        data: accountData,
      });
      return newAccount;
    } catch (error) {
      console.error('Error creating social media account:', error);
      throw new Error('Failed to create social media account.');
    }
  }


  async updateAccount(accountId: string, accountData: {
    accountName?: string;
    access_token?: string;
    refresh_token?: string;
    token_expiry?: Date;
  }) {
    try {
      const updatedAccount = await prisma.socialMediaAccount.update({
        where: {
          accountId
        },
        data : accountData
      });
      return updatedAccount;
    } catch (error) {
      console.error('Error updating social media account:', error);
      throw new Error('Failed to update social media account.');
    }
  }
}
