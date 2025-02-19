import { IYouTubeService } from "../interfaces/youtube/IYouTubeService";
import { YoutubeRepository } from "../repositories/youtube.repositories";
import { YOUTUBE_SCOPES } from "../constants/youtube.constants";
import YouTubeApiClient from '../utils/youtubeapi.client.utils';
import { ApiError } from "@utils/apierror";
import { SocialMediaAccountService } from "./socialmediaaccount.services";
import { Content } from "@prisma/client";

export class YoutubeService implements IYouTubeService {
  private youtubeRepository: YoutubeRepository;
  private socialMediaService: SocialMediaAccountService

  constructor(authRepository: YoutubeRepository, socialMediaService: SocialMediaAccountService) {
    this.youtubeRepository = authRepository;
    this.socialMediaService = socialMediaService;
  }

  // youtube auth
  generateAuthUrl(): string {
    return this.youtubeRepository.generateAuthUrl(YOUTUBE_SCOPES);
  }

  async handleCallback(code: string, userId: string): Promise<{ accessToken: string; refreshToken?: string }> {
    const tokens = await this.youtubeRepository.getTokens(code);

    if (!tokens) {
      throw new ApiError(400, "Error in generating tokens!");
    }

    const youtubeClient = new YouTubeApiClient(tokens.access_token!);

    const { channelId, accountName } = await youtubeClient.getChannelInfo();

    // The expiry_date is already in milliseconds, so we can directly use it
    const expiryDate = Number(tokens.expiry_date);

    // Create Date object directly using the expiryDate (which is already in milliseconds)
    const tokenExpiry = new Date(expiryDate);

    const account = await this.socialMediaService.getAccountByUserId(userId, 'YouTube');

    if(!account){
      // After retrieving tokens, create a new social media account for the user
      await this.socialMediaService.createAccount({
        userId,
        platform: 'YouTube',
        accountId: channelId,
        accountName: accountName,
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
        token_expiry: tokenExpiry
      });
    }
    else{
      await this.socialMediaService.updateAccount(account.accountId, {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
        token_expiry: tokenExpiry
      })
    }


    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
    };
  }


  // content upload 
  async uploadContent(userId: string, title: string, description: string, videoBuffer: Buffer) {

    const account = await this.socialMediaService.getAccountByUserId(userId, 'YouTube');

    if (!account) {
      throw new ApiError(404, 'YouTube account does not exists');
    }

    if (!userId || !title || !description || !videoBuffer) {
      throw new ApiError(400, 'Missing required video fields');
    }

    if (!videoBuffer) throw new ApiError(400, 'Video file buffer is empty');

    // console.log('Received Video Buffer:', videoFile.buffer);
    // console.log('File Name:', videoFile.originalname);
    // console.log('MIME Type:', videoFile.mimetype);
    // console.log('File Size:', videoFile.size);

    const youtubeClient = new YouTubeApiClient(account.access_token!);

    // Upload to YouTube using the client
    const uploadResponse = await youtubeClient.uploadVideo({
      title,
      description,
      file: videoBuffer,
    });

    return await this.youtubeRepository.createContentWithMetrics({
      userId,
      title,
      description,
      youtubeVideoId: uploadResponse.id,
      videoUrl: `https://youtube.com/watch?v=${uploadResponse.id}`,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      status: 'pending',
    });
  }

  async getContent(userId: string, contentId: string) {

    const account = await this.socialMediaService.getAccountByUserId(userId, 'YouTube');

    if (!account) {
      throw new ApiError(404, 'YouTube account does not exists');
    }

    if (!contentId) {
      throw new ApiError(400, 'Missing Content Id in services');
    }

    // Await content from the repository
    let content = await this.youtubeRepository.getContent(contentId);

    // console.log(content);

    if (!content) {
      throw new ApiError(404, 'Content not found');
    }

    const youtubeClient = new YouTubeApiClient(account.access_token!);

    // Fetch metrics from YouTube API
    const metrics = await youtubeClient.getVideoMetrics(content.youtubeVideoId);

    // console.log("metrics of video", metrics);

    // Update metrics in the database
    await this.updateContentMetrics(contentId, metrics);

    // Refetch updated content with updated metrics
    content = await this.youtubeRepository.getContent(contentId);

    return content;
  }

  async getAllContent(userId: string): Promise<Content[]> {
    // Step 1: Fetch user's YouTube account
    let account = await this.socialMediaService.getAccountByUserId(userId, 'YouTube');
  
    if (!account) {
      throw new ApiError(404, 'YouTube account does not exist');
    }
  
    if (!userId || !account.access_token) {
      throw new ApiError(400, 'User ID and Access Token are required');
    }
  
    // Step 2: Check if the access token is expired
    if (account.token_expiry && new Date(account.token_expiry) <= new Date()) {
      console.log('YouTube access_token has expired');
      await this.socialMediaService.updateTokens(userId, 'YouTube');
      account = await this.socialMediaService.getAccountByUserId(userId, 'YouTube');

      // throw new ApiError(401, 'Access token has expired. Please reauthorize your account.');
    }

    if (!account) {
      throw new ApiError(404, 'YouTube account does not exist');
    }
  
  
    // Step 3: Fetch all videos of the user
    const userContent = await this.youtubeRepository.getAllContent(userId);
  
    if (!userContent.length) {
      throw new ApiError(404, `No videos found for user ${userId}`);
    }
  
    // Step 4: Initialize YouTube API Client
    const youtubeClient = new YouTubeApiClient(account.access_token!);
  
    // Step 5: Loop through videos and fetch/update metrics
    for (const content of userContent) {
      try {
        // Fetch metrics from the YouTube API
        const metrics = await youtubeClient.getVideoMetrics(content.youtubeVideoId);
  
        // Update metrics in the database
        await this.youtubeRepository.updateMetrics(content.id, metrics);
      } catch (error) {
        console.error(`Failed to update metrics for video ${content.youtubeVideoId}:`, error);
      }
    }
  
    return userContent;
  }
  



  private async updateContentMetrics(contentId: string, metrics: { viewCount: number; likeCount: number; commentCount: number }) {
    await this.youtubeRepository.updateMetrics(contentId, {
      views: metrics.viewCount,
      likes: metrics.likeCount,
      comments: metrics.commentCount,
      engagementScore: metrics.likeCount + metrics.commentCount,
    });
  }
}