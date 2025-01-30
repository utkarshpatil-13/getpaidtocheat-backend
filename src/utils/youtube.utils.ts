import { google } from "googleapis";
import { YOUTUBE_OAUTH_CONFIG } from "../config/youtube.config";

export class OAuthClient {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      YOUTUBE_OAUTH_CONFIG.clientId,
      YOUTUBE_OAUTH_CONFIG.clientSecret,
      YOUTUBE_OAUTH_CONFIG.redirectUri
    );
  }

  generateAuthUrl(scopes: string[]): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }
}
