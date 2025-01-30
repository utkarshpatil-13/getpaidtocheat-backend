export interface ISocialMediaAccountService {

    /**
     * Retrieves social media account associated with a specific user and platform.
     * @param userId - The ID of the user.
     * @param platform - The platform (e.g., YouTube, Twitch).
     * @returns The SocialMediaAccount record.
     */
    getAccountByUserId(userId: string, platform: string): Promise<any>;
  
    /**
     * Updates access token, refresh token, and token expiry for a specific user and platform.
     * @param userId - The ID of the user.
     * @param platform - The platform (e.g., YouTube, Twitch).
     * @param tokenData - The new token data.
     * @returns The updated SocialMediaAccount record.
     */
    updateTokens(userId: string, platform: string, tokenData: {
      access_token?: string;
      refresh_token?: string;
      token_expiry?: Date;
    }): Promise<any>;
  
    /**
     * Creates a new social media account entry.
     * @param accountData - Account data including all fields.
     * @returns The newly created SocialMediaAccount record.
     */
    createAccount(accountData: {
      userId: string;
      platform: string;
      accountId: string;
      accountName: string;
      access_token?: string;
      refresh_token?: string;
      token_expiry?: Date;
    }): Promise<any>;
  }
  