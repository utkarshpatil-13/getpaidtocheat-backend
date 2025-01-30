import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
import { ApiError } from './apierror';

class YouTubeApiClient {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://www.googleapis.com/upload/youtube/v3/videos',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
  }

  async uploadVideo(videoData: { title: string; description: string; file: Buffer }) {
    try {
      const formData = new FormData();

      // Metadata Part
      const metadata = {
        snippet: {
          title: videoData.title,
          description: videoData.description,
        },
        status: {
          privacyStatus: 'public', // Options: 'public', 'unlisted', 'private'
        },
      };

      formData.append('metadata', JSON.stringify(metadata), {
        contentType: 'application/json',
      });

      // Video Part (Buffer to Stream)
      const videoStream = Readable.from(videoData.file);
      formData.append('file', videoStream, {
        filename: 'video.mp4',
        contentType: 'video/mp4',
      });

      // Perform Upload
      const response = await this.client.post('/', formData, {
        params: {
          part: 'snippet,status',
          uploadType: 'multipart', // Indicates a multipart upload
        },
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error: any) {
      console.error('YouTube Video Upload Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getVideoMetrics(videoId: string) {
    try {
      const response = await this.client.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'statistics',
          id: videoId,
        },
      });
  
      const statistics = response.data.items[0]?.statistics;
  
      if (!statistics) {
        throw new Error('No statistics available for the provided video ID.');
      }
  
      return {
        viewCount: statistics.viewCount || '0',
        likeCount: statistics.likeCount || '0',
        commentCount: statistics.commentCount || '0',
      };
    } catch (error: any) {
      console.error('YouTube Video Metrics Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getChannelInfo(){
    try{
      const response = await this.client.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'id, snippet',
          mine: true,
        }
      });

      const channel = response.data.items[0];
      if(!channel){
        throw new ApiError(400, 'No channel information found for user');
      }

      return {
        channelId: channel.id,
        accountName: channel.snippet?.title || 'Unknown Account Name',
      };
    }
    catch(error: any){
      console.log('Youtube Channel Info Error', error.reponse?.data || error.message);
      throw error;
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; token_expiry: Date }> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
  
      const { access_token, expires_in } = response.data;
      const token_expiry = new Date(Date.now() + expires_in * 1000);
  
      console.log('YouTube Access Token Refreshed Successfully');
  
      return { access_token, token_expiry };
    } catch (error: any) {
      console.error('YouTube Token Refresh Error:', error.response?.data || error.message);
      throw new ApiError(500, 'Failed to refresh YouTube access token! Please authorize again');
    }
  }
  
}

export default YouTubeApiClient;
