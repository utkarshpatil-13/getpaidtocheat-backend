import { Content } from '@prisma/client';

export interface IYouTubeService {
  // For youtube authentication 
  generateAuthUrl(): string;
  handleCallback(code: string, userId : string): Promise<{ accessToken: string; refreshToken?: string }>;

  // For content upload
  uploadContent(userId: string, title: string, description: string, videoFile: any, accessToken: string): Promise<any>;
  getContent(id: string, accessToken: string): Promise<any>;
  getAllContent(userId : string, accessToken: string) : Promise<Content[]>;
}
